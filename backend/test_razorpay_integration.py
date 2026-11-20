import sys
import os
import json
import hmac
import hashlib
import unittest

# Add backend root to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Set mock env vars for testing
os.environ["POSTGRES_URI"] = ""
os.environ["RAZORPAY_KEY_ID"] = "rzp_test_MockKeyId12345"
os.environ["RAZORPAY_KEY_SECRET"] = "MockKeySecret67890"
os.environ["RAZORPAY_WEBHOOK_SECRET"] = "MockWebhookSecret99999"
os.environ["FRONTEND_URL"] = "http://localhost:3000"

from app import app, db
from models import User, Order, Payment
from services.razorpay_service import razorpay_service


class TestRazorpayIntegration(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

            # Create test user
            self.test_user = User(
                email="testuser@example.com",
                password_hash="hashedpass",
                name="Test Customer",
                phone="9876543210",
                street_name="123 Jewelry Street",
                city="Ahmedabad",
                state="Gujarat",
                pincode="380001"
            )
            db.session.add(self.test_user)
            db.session.commit()
            self.user_id = self.test_user.id

            # Create test order
            self.test_order = Order(
                user_id=self.user_id,
                total_amount=2499.00,
                status="Pending",
                payment_method="Razorpay",
                items_json=json.dumps([{"name": "Gold Ring", "price": 2499, "quantity": 1}])
            )
            db.session.add(self.test_order)
            db.session.commit()
            self.order_id = self.test_order.id

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_signature_verification_valid(self):
        """Test cryptographic HMAC-SHA256 signature verification with valid data."""
        razorpay_order_id = "order_N1234567890"
        razorpay_payment_id = "pay_P9876543210"

        msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8')
        valid_signature = hmac.new(
            "MockKeySecret67890".encode('utf-8'),
            msg,
            hashlib.sha256
        ).hexdigest()

        is_valid = razorpay_service.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=valid_signature
        )
        self.assertTrue(is_valid, "Valid signature must pass cryptographic verification")

    def test_signature_verification_invalid(self):
        """Test cryptographic HMAC-SHA256 signature verification with tampered signature."""
        razorpay_order_id = "order_N1234567890"
        razorpay_payment_id = "pay_P9876543210"
        tampered_signature = "invalid_tampered_hex_signature_abcdef1234567890"

        is_valid = razorpay_service.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=tampered_signature
        )
        self.assertFalse(is_valid, "Tampered signature must be rejected")

    def test_webhook_signature_verification(self):
        """Test webhook signature verification using webhook secret."""
        payload_bytes = json.dumps({"event": "payment.captured", "payload": {}}).encode('utf-8')
        valid_sig = hmac.new(
            "MockWebhookSecret99999".encode('utf-8'),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()

        is_valid = razorpay_service.verify_webhook_signature(payload_bytes, valid_sig)
        self.assertTrue(is_valid, "Valid webhook signature must pass")

        is_invalid = razorpay_service.verify_webhook_signature(payload_bytes, "invalid_sig")
        self.assertFalse(is_invalid, "Invalid webhook signature must fail")

    def test_verify_payment_endpoint_success(self):
        """Test POST /api/payments/verify updates Payment and Order to SUCCESS/Processing."""
        with app.app_context():
            # Create a pending payment
            rzp_order_id = "order_TEST_1001"
            payment = Payment(
                order_id=self.order_id,
                user_id=self.user_id,
                gateway_order_id=rzp_order_id,
                amount=2499.00,
                currency="INR",
                status="PENDING",
                gateway="RAZORPAY"
            )
            db.session.add(payment)
            db.session.commit()

        rzp_payment_id = "pay_TEST_9001"
        msg = f"{rzp_order_id}|{rzp_payment_id}".encode('utf-8')
        valid_signature = hmac.new(
            "MockKeySecret67890".encode('utf-8'),
            msg,
            hashlib.sha256
        ).hexdigest()

        resp = self.client.post("/api/payments/verify", json={
            "order_id": self.order_id,
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": rzp_payment_id,
            "razorpay_signature": valid_signature
        })

        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("status"), "Processing")

        with app.app_context():
            updated_payment = Payment.query.filter_by(gateway_order_id=rzp_order_id).first()
            self.assertEqual(updated_payment.status, "SUCCESS")
            self.assertEqual(updated_payment.gateway_payment_id, rzp_payment_id)

            updated_order = db.session.get(Order, self.order_id)
            self.assertEqual(updated_order.status, "Processing")

    def test_verify_payment_endpoint_invalid_signature(self):
        """Test POST /api/payments/verify rejects fraudulent signature with 400."""
        with app.app_context():
            rzp_order_id = "order_TEST_1002"
            payment = Payment(
                order_id=self.order_id,
                user_id=self.user_id,
                gateway_order_id=rzp_order_id,
                amount=2499.00,
                currency="INR",
                status="PENDING",
                gateway="RAZORPAY"
            )
            db.session.add(payment)
            db.session.commit()

        resp = self.client.post("/api/payments/verify", json={
            "order_id": self.order_id,
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": "pay_TEST_FAKE",
            "razorpay_signature": "fraudulent_signature_hex"
        })

        self.assertEqual(resp.status_code, 400)
        data = resp.get_json()
        self.assertFalse(data.get("success"))

        with app.app_context():
            updated_payment = Payment.query.filter_by(gateway_order_id=rzp_order_id).first()
            self.assertEqual(updated_payment.status, "FAILED")

    def test_get_payment_status(self):
        """Test GET /api/payments/<order_id>/status returns accurate details."""
        with app.app_context():
            rzp_order_id = "order_TEST_1003"
            payment = Payment(
                order_id=self.order_id,
                user_id=self.user_id,
                gateway_order_id=rzp_order_id,
                gateway_payment_id="pay_TEST_9003",
                amount=2499.00,
                currency="INR",
                status="SUCCESS",
                gateway="RAZORPAY"
            )
            db.session.add(payment)
            db.session.commit()

        resp = self.client.get(f"/api/payments/{self.order_id}/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data.get("order_id"), self.order_id)
        self.assertEqual(data.get("payment_status"), "SUCCESS")
        self.assertEqual(data.get("razorpay_order_id"), rzp_order_id)
        self.assertEqual(data.get("razorpay_payment_id"), "pay_TEST_9003")


if __name__ == "__main__":
    unittest.main()
