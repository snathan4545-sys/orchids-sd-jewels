import sys
import os
import json
import base64
import hmac
import hashlib
import unittest

# Add backend root to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Set mock env vars for testing
os.environ["CASHFREE_APP_ID"] = "TEST_APP_ID_12345"
os.environ["CASHFREE_SECRET_KEY"] = "TEST_SECRET_KEY_67890"
os.environ["CASHFREE_ENVIRONMENT"] = "SANDBOX"
os.environ["CASHFREE_API_VERSION"] = "2023-08-01"

from app import app, db
from models import User, Order, Payment
from services.cashfree_service import cashfree_service


class TestCashfreeIntegration(unittest.TestCase):
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
                name="Test User",
                phone="9876543210",
                street_name="123 Main St",
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
                total_amount=499.00,
                status="Pending",
                payment_method="Direct Bank Transfer",
                items_json=json.dumps([{"name": "Gold Ring", "price": 499.00, "quantity": 1}])
            )
            db.session.add(self.test_order)
            db.session.commit()
            self.order_id = self.test_order.id

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_01_signature_verification(self):
        """Test HMAC SHA256 Webhook signature generation and verification"""
        secret = os.environ["CASHFREE_SECRET_KEY"]
        timestamp = "1700000000"
        raw_body = b'{"type":"PAYMENT_SUCCESS_WEBHOOK","data":{"order":{"order_id":"CF_ORD_1_1700000"}}}'

        data_to_sign = (timestamp + raw_body.decode('utf-8')).encode('utf-8')
        valid_signature = base64.b64encode(
            hmac.new(secret.encode('utf-8'), data_to_sign, hashlib.sha256).digest()
        ).decode('utf-8')

        # Test valid signature
        self.assertTrue(cashfree_service.verify_webhook_signature(raw_body, timestamp, valid_signature))

        # Test invalid signature
        self.assertFalse(cashfree_service.verify_webhook_signature(raw_body, timestamp, "invalid_sig_string"))

    def test_02_create_payment_order_invalid_order_id(self):
        """Test creating payment for non-existent order"""
        res = self.client.post('/api/payments/create-order', json={'order_id': 99999})
        self.assertEqual(res.status_code, 404)

    def test_03_payment_status_endpoint(self):
        """Test GET /api/payments/{order_id}/status"""
        res = self.client.get(f'/api/payments/{self.order_id}/status')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['order_id'], self.order_id)
        self.assertEqual(data['payment_status'], 'PENDING')
        self.assertEqual(data['amount'], 499.00)

    def test_04_webhook_invalid_signature_rejection(self):
        """Test Webhook rejects unverified signature with 401"""
        res = self.client.post(
            '/api/payments/webhook/cashfree',
            data=b'{"event":"test"}',
            headers={
                'x-webhook-timestamp': '1700000000',
                'x-webhook-signature': 'bad_signature'
            }
        )
        self.assertEqual(res.status_code, 401)

    def test_05_webhook_successful_payment_and_idempotency(self):
        """Test Webhook marks Payment SUCCESS, updates Order, and handles duplicates idempotently"""
        with app.app_context():
            # Create PENDING payment
            cashfree_ord_id = f"CF_ORD_{self.order_id}_170000"
            payment = Payment(
                order_id=self.order_id,
                user_id=self.user_id,
                cashfree_order_id=cashfree_ord_id,
                payment_session_id="session_123",
                amount=499.00,
                currency="INR",
                status="PENDING",
                gateway="CASHFREE"
            )
            db.session.add(payment)
            db.session.commit()

        # Generate valid webhook payload
        payload_dict = {
            "type": "PAYMENT_SUCCESS_WEBHOOK",
            "data": {
                "order": {
                    "order_id": cashfree_ord_id,
                    "order_status": "PAID"
                },
                "payment": {
                    "cf_payment_id": "12345678",
                    "payment_status": "SUCCESS",
                    "payment_group": "CREDIT_CARD"
                }
            }
        }
        raw_bytes = json.dumps(payload_dict).encode('utf-8')
        timestamp = "1700000000"
        secret = os.environ["CASHFREE_SECRET_KEY"]
        data_to_sign = (timestamp + raw_bytes.decode('utf-8')).encode('utf-8')
        valid_sig = base64.b64encode(
            hmac.new(secret.encode('utf-8'), data_to_sign, hashlib.sha256).digest()
        ).decode('utf-8')

        # First Webhook Request
        res = self.client.post(
            '/api/payments/webhook/cashfree',
            data=raw_bytes,
            headers={
                'Content-Type': 'application/json',
                'x-webhook-timestamp': timestamp,
                'x-webhook-signature': valid_sig
            }
        )
        self.assertEqual(res.status_code, 200)

        # Verify DB state
        with app.app_context():
            updated_payment = Payment.query.filter_by(cashfree_order_id=cashfree_ord_id).first()
            self.assertEqual(updated_payment.status, 'SUCCESS')
            self.assertEqual(updated_payment.cashfree_payment_id, '12345678')

            updated_order = Order.query.get(self.order_id)
            self.assertEqual(updated_order.status, 'Processing')

        # Second Webhook Request (Duplicate Idempotency Test)
        res_dup = self.client.post(
            '/api/payments/webhook/cashfree',
            data=raw_bytes,
            headers={
                'Content-Type': 'application/json',
                'x-webhook-timestamp': timestamp,
                'x-webhook-signature': valid_sig
            }
        )
        self.assertEqual(res_dup.status_code, 200)
        self.assertIn('Already processed', res_dup.get_json().get('message', ''))


if __name__ == '__main__':
    unittest.main()
