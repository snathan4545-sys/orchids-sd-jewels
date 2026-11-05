import os
import json
import logging
import base64
import hmac
import hashlib
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

class CashfreeService:
    def __init__(self):
        self.app_id = os.environ.get("CASHFREE_APP_ID", "")
        self.secret_key = os.environ.get("CASHFREE_SECRET_KEY", "")
        self.environment = os.environ.get("CASHFREE_ENVIRONMENT", "SANDBOX").upper()
        self.api_version = os.environ.get("CASHFREE_API_VERSION", "2023-08-01")
        self.return_url = os.environ.get("CASHFREE_RETURN_URL", "http://localhost:3000/checkout/status?order_id={order_id}")
        self.notify_url = os.environ.get("CASHFREE_NOTIFY_URL", "http://localhost:5000/api/payments/webhook/cashfree")

        if self.environment == "PRODUCTION":
            self.base_url = "https://api.cashfree.com/pg"
        else:
            self.base_url = "https://sandbox.cashfree.com/pg"

    def _get_headers(self):
        return {
            "Content-Type": "application/json",
            "x-client-id": self.app_id,
            "x-client-secret": self.secret_key,
            "x-api-version": self.api_version,
        }

    def is_configured(self) -> bool:
        return bool(self.app_id and self.secret_key)

    def _make_request(self, method: str, url: str, payload: dict = None) -> dict:
        headers = self._get_headers()
        data_bytes = json.dumps(payload).encode('utf-8') if payload else None

        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method.upper())
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp_bytes = resp.read()
                return json.loads(resp_bytes.decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_bytes = e.read()
            try:
                error_json = json.loads(error_bytes.decode('utf-8'))
            except Exception:
                error_json = {"message": f"HTTP Error {e.code}"}
            logger.error(f"Cashfree API HTTP Error {e.code} for {url}: {error_json}")
            raise Exception(error_json.get("message", f"Cashfree API Error {e.code}"))
        except Exception as e:
            logger.error(f"Error connecting to Cashfree API ({url}): {e}")
            raise Exception(f"Cashfree gateway connection error: {str(e)}")

    def create_order(
        self,
        cashfree_order_id: str,
        amount: float,
        customer_id: str,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        return_url: str = None,
        notify_url: str = None,
    ) -> dict:
        """
        Creates a Cashfree PG payment order.
        Returns the Cashfree response containing payment_session_id.
        """
        if not self.is_configured():
            logger.error("Cashfree credentials are missing in environment variables.")
            raise ValueError("Cashfree integration is not configured properly.")

        order_amount = round(float(amount), 2)
        
        clean_phone = "".join(filter(str.isdigit, str(customer_phone)))
        if len(clean_phone) > 10:
            clean_phone = clean_phone[-10:]
        elif len(clean_phone) < 10:
            clean_phone = "9999999999"

        payload = {
            "order_id": cashfree_order_id,
            "order_amount": order_amount,
            "order_currency": "INR",
            "customer_details": {
                "customer_id": str(customer_id),
                "customer_name": customer_name or "Valued Customer",
                "customer_email": customer_email or "customer@example.com",
                "customer_phone": clean_phone
            },
            "order_meta": {
                "return_url": return_url or self.return_url.format(order_id=cashfree_order_id),
                "notify_url": notify_url or self.notify_url
            }
        }

        url = f"{self.base_url}/orders"
        logger.info(f"Creating Cashfree order: {cashfree_order_id} for amount {order_amount}")
        return self._make_request("POST", url, payload)

    def get_order_status(self, cashfree_order_id: str) -> dict:
        """
        Fetches status of a Cashfree PG order.
        """
        if not self.is_configured():
            raise ValueError("Cashfree credentials missing.")

        url = f"{self.base_url}/orders/{cashfree_order_id}"
        return self._make_request("GET", url)

    def get_order_payments(self, cashfree_order_id: str) -> list:
        """
        Fetches payment attempts for a Cashfree PG order.
        """
        if not self.is_configured():
            return []

        url = f"{self.base_url}/orders/{cashfree_order_id}/payments"
        try:
            return self._make_request("GET", url)
        except Exception as e:
            logger.error(f"Error fetching Cashfree payments for {cashfree_order_id}: {e}")
            return []

    def verify_webhook_signature(self, raw_body: bytes, timestamp: str, signature: str) -> bool:
        """
        Verifies Cashfree V3 Webhook signature.
        Payload to sign = timestamp + raw_body
        Algorithm = HMAC SHA256 base64 encoded
        """
        if not signature or not timestamp or not self.secret_key:
            logger.warning("Missing signature, timestamp, or secret key for webhook verification.")
            return False

        try:
            body_str = raw_body.decode('utf-8') if isinstance(raw_body, bytes) else str(raw_body)
            data_to_sign = (timestamp + body_str).encode('utf-8')
            computed_sig = base64.b64encode(
                hmac.new(self.secret_key.encode('utf-8'), data_to_sign, hashlib.sha256).digest()
            ).decode('utf-8')
            return hmac.compare_digest(computed_sig, signature)
        except Exception as e:
            logger.error(f"Error during webhook signature verification: {e}")
            return False

cashfree_service = CashfreeService()
