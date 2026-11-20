import os
import json
import logging
import hmac
import hashlib
import base64
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Load .env relative to backend root
basedir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(basedir, ".env"))

logger = logging.getLogger(__name__)

# Try importing razorpay SDK if installed
try:
    import razorpay
    HAS_RAZORPAY_SDK = True
except ImportError:
    razorpay = None
    HAS_RAZORPAY_SDK = False


class RazorpayService:
    """
    Razorpay India Payment Gateway Service
    Handles order creation, client signature verification, webhook signature verification,
    and payment fetching with both official SDK and zero-dependency HTTP fallbacks.
    """

    def __init__(self):
        self.key_id = os.environ.get("RAZORPAY_KEY_ID", "").strip()
        self.key_secret = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()
        self.webhook_secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "").strip()
        self.frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000").strip()

        self._client = None
        if HAS_RAZORPAY_SDK and self.is_configured():
            try:
                self._client = razorpay.Client(auth=(self.key_id, self.key_secret))
            except Exception as e:
                logger.warning(f"Could not initialize razorpay.Client: {e}")

    def is_configured(self) -> bool:
        """Returns True if merchant credentials (Key ID and Secret) are configured."""
        return bool(self.key_id and self.key_secret)

    def _get_client(self):
        if self._client is None and HAS_RAZORPAY_SDK and self.is_configured():
            self._client = razorpay.Client(auth=(self.key_id, self.key_secret))
        return self._client

    def create_order(self, order_id: int, amount: float, currency: str = "INR", notes: dict = None) -> dict:
        """
        Creates a new Razorpay Order.
        Amount must be in paise (1 INR = 100 paise).
        """
        if not self.is_configured():
            logger.error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing.")
            raise ValueError("Razorpay payment gateway is not configured. Please add API keys to .env.")

        # Razorpay amount is represented in smallest currency unit (paise)
        amount_paise = int(round(amount * 100))
        if amount_paise <= 0:
            raise ValueError("Order amount must be greater than zero.")

        receipt_id = f"rcpt_{order_id}"
        order_notes = {
            "internal_order_id": str(order_id),
            "platform": "SD Jewels"
        }
        if notes:
            order_notes.update(notes)

        payload = {
            "amount": amount_paise,
            "currency": currency.upper(),
            "receipt": receipt_id,
            "payment_capture": 1, # Auto-capture payment
            "notes": order_notes
        }

        # Use razorpay SDK if available
        client = self._get_client()
        if client:
            try:
                rzp_order = client.order.create(data=payload)
                logger.info(f"Created Razorpay order via SDK: {rzp_order.get('id')} for Order #{order_id}")
                return rzp_order
            except Exception as e:
                logger.error(f"Error creating order with Razorpay SDK: {e}. Falling back to REST API.")

        # Direct REST API fallback
        url = "https://api.razorpay.com/v1/orders"
        auth_string = f"{self.key_id}:{self.key_secret}"
        encoded_auth = base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {encoded_auth}"
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                logger.info(f"Created Razorpay order via REST API: {resp_data.get('id')} for Order #{order_id}")
                return resp_data
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            logger.error(f"Razorpay API Error {e.code}: {error_body}")
            try:
                err_json = json.loads(error_body)
                err_desc = err_json.get("error", {}).get("description", error_body)
            except Exception:
                err_desc = error_body
            raise Exception(f"Razorpay Order Error: {err_desc}")
        except Exception as e:
            logger.error(f"Failed to communicate with Razorpay API: {e}")
            raise Exception(f"Failed to connect to Razorpay: {str(e)}")

    def verify_payment_signature(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Cryptographically verifies the authenticity of client checkout payment signature.
        Generates HMAC-SHA256 of `razorpay_order_id|razorpay_payment_id` with `key_secret`.
        """
        if not self.key_secret:
            logger.error("Cannot verify payment signature: RAZORPAY_KEY_SECRET is not set.")
            return False

        if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
            logger.warning("Missing required signature verification parameters.")
            return False

        # If SDK is available, can also use client.utility.verify_payment_signature
        client = self._get_client()
        if client:
            try:
                client.utility.verify_payment_signature({
                    "razorpay_order_id": razorpay_order_id.strip(),
                    "razorpay_payment_id": razorpay_payment_id.strip(),
                    "razorpay_signature": razorpay_signature.strip()
                })
                return True
            except razorpay.errors.SignatureVerificationError:
                logger.warning(f"Razorpay SDK signature verification failed for {razorpay_order_id}")
                return False
            except Exception as e:
                logger.warning(f"SDK verification exception: {e}, using HMAC fallback.")

        # Standard RFC HMAC-SHA256 verification
        msg = f"{razorpay_order_id.strip()}|{razorpay_payment_id.strip()}".encode("utf-8")
        generated_signature = hmac.new(
            self.key_secret.encode("utf-8"),
            msg,
            hashlib.sha256
        ).hexdigest()

        is_valid = hmac.compare_digest(generated_signature.lower(), razorpay_signature.strip().lower())
        if not is_valid:
            logger.warning(
                f"Razorpay signature mismatch for order {razorpay_order_id}. "
                f"Generated: {generated_signature}, Received: {razorpay_signature}"
            )
        return is_valid

    def verify_webhook_signature(self, raw_body: bytes, received_signature: str) -> bool:
        """
        Verifies the X-Razorpay-Signature webhook header.
        Uses RAZORPAY_WEBHOOK_SECRET, falling back to RAZORPAY_KEY_SECRET if not set.
        """
        secret = self.webhook_secret or self.key_secret
        if not secret:
            logger.error("Cannot verify webhook signature: Webhook Secret is not configured.")
            return False

        if not received_signature or not raw_body:
            return False

        # SDK webhook verification if available
        client = self._get_client()
        if client and hasattr(client.utility, "verify_webhook_signature"):
            try:
                client.utility.verify_webhook_signature(
                    raw_body.decode("utf-8") if isinstance(raw_body, bytes) else str(raw_body),
                    received_signature,
                    secret
                )
                return True
            except Exception:
                pass

        if isinstance(raw_body, str):
            raw_body = raw_body.encode("utf-8")

        expected_signature = hmac.new(
            secret.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_signature.lower(), received_signature.strip().lower())

    def fetch_payment(self, payment_id: str) -> dict:
        """
        Fetches payment details (method, status, amount, fee) directly from Razorpay API.
        """
        if not self.is_configured():
            return {}

        client = self._get_client()
        if client:
            try:
                return client.payment.fetch(payment_id)
            except Exception as e:
                logger.error(f"Error fetching payment via Razorpay SDK: {e}")

        # REST fallback
        url = f"https://api.razorpay.com/v1/payments/{payment_id}"
        auth_string = f"{self.key_id}:{self.key_secret}"
        encoded_auth = base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")

        headers = {
            "Authorization": f"Basic {encoded_auth}"
        }

        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as e:
            logger.error(f"Failed to fetch payment details for {payment_id}: {e}")
            return {}


razorpay_service = RazorpayService()
