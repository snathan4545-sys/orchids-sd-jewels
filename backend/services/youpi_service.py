# YOUPI UPI Payment Gateway Service (Commented out)
# import os
# import json
# import logging
# import hmac
# import hashlib
# import urllib.request
# import urllib.error
#
# logger = logging.getLogger(__name__)
#
# class YoupiService:
#     def __init__(self):
#         self.api_url = os.environ.get("YOUPI_API_URL", "http://localhost:6100").rstrip("/")
#         self.checkout_url = os.environ.get("YOUPI_CHECKOUT_URL", "http://localhost:7000").rstrip("/")
#         self.merchant_id = os.environ.get("YOUPI_MERCHANT_ID", "00000000-0000-0000-0000-000000000001")
#         self.api_key = os.environ.get("YOUPI_MERCHANT_API_KEY", "mk_live_ac939797056327a61fb1014c6498a08dba455970efaeb29b")
#         self.webhook_secret = os.environ.get("YOUPI_WEBHOOK_SECRET", "19b5545b2b7c291f954f7417ebd6c16faf9b2ffe5a5b043c3aaaa90910a6af94")
#
#     def is_configured(self) -> bool:
#         return bool(self.merchant_id and self.api_key)
#
#     def create_payment(
#         self,
#         order_id: str,
#         amount: float,
#         customer_name: str = "Customer",
#         customer_phone: str = "9999999999",
#         customer_email: str = "",
#         metadata: dict = None
#     ) -> dict:
#         """
#         Creates a payment session in YOUPI PG Core API.
#         Returns the gateway response containing checkoutUrl and paymentId.
#         """
#         url = f"{self.api_url}/api/v1/payments"
#         order_amount_str = f"{float(amount):.2f}"
#
#         clean_phone = "".join(filter(str.isdigit, str(customer_phone)))
#         if len(clean_phone) > 10:
#             clean_phone = clean_phone[-10:]
#         elif len(clean_phone) < 10:
#             clean_phone = "9952202256"
#
#         payload = {
#             "orderId": str(order_id),
#             "amount": order_amount_str,
#             "currency": "INR",
#             "customer": {
#                 "fullName": customer_name or "SD Trends Customer",
#                 "phoneNumber": clean_phone,
#                 "email": customer_email or ""
#             },
#             "metadata": metadata or {}
#         }
#
#         headers = {
#             "Content-Type": "application/json",
#             "X-Merchant-Id": self.merchant_id,
#             "X-Merchant-Key": self.api_key
#         }
#
#         data_bytes = json.dumps(payload).encode("utf-8")
#         req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
#
#         try:
#             with urllib.request.urlopen(req, timeout=15) as resp:
#                 resp_bytes = resp.read()
#                 return json.loads(resp_bytes.decode("utf-8"))
#         except urllib.error.HTTPError as e:
#             error_bytes = e.read()
#             try:
#                 error_json = json.loads(error_bytes.decode("utf-8"))
#             except Exception:
#                 error_json = {"error": f"HTTP Error {e.code}"}
#             logger.error(f"YOUPI API HTTP Error {e.code}: {error_json}")
#             raise Exception(error_json.get("error", f"YOUPI API Error {e.code}"))
#         except Exception as e:
#             logger.error(f"Error connecting to YOUPI API ({url}): {e}")
#             raise Exception(f"YOUPI gateway connection error: {str(e)}")
#
#     def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool:
#         """
#         Verifies YOUPI PG HMAC-SHA256 webhook signature.
#         Header: X-Gateway-Signature: sha256=<64_hex_chars>
#         """
#         if not signature or not self.webhook_secret:
#             logger.warning("Missing signature or webhook secret for YOUPI webhook verification.")
#             return False
#
#         try:
#             expected_hex = hmac.new(
#                 self.webhook_secret.encode("utf-8"),
#                 raw_body,
#                 hashlib.sha256
#             ).hexdigest()
#             expected_signature = f"sha256={expected_hex}"
#
#             return hmac.compare_digest(signature.strip(), expected_signature)
#         except Exception as e:
#             logger.error(f"Error during YOUPI webhook signature verification: {e}")
#             return False
#
# youpi_service = YoupiService()
