import os
import json
import logging
from flask import Blueprint, request, jsonify
from models import db, Order, User, Payment
from services.razorpay_service import razorpay_service

logger = logging.getLogger(__name__)

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')


@payments_bp.route('/create-order', methods=['POST'])
@payments_bp.route('/razorpay/create-order', methods=['POST'])
def create_payment_order():
    """
    Creates a Razorpay Order for an existing internal order.
    The order amount is strictly retrieved from the database to prevent client manipulation.
    Returns Razorpay order ID, key ID, amount (paise), currency, and customer prefill details.
    """
    try:
        data = request.json or {}
        internal_order_id = data.get('order_id')

        if not internal_order_id:
            return jsonify({'error': 'order_id is required'}), 400

        # Fetch internal order from DB
        order = db.session.get(Order, internal_order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Check if order is already paid
        if order.status in ['Processing', 'Shipped', 'Completed', 'Paid']:
            return jsonify({'error': 'Order is already paid'}), 400

        if order.status == 'Declined':
            return jsonify({'error': 'Order has been declined'}), 400

        # Calculate amount strictly from DB
        amount = float(order.total_amount)
        if amount <= 0:
            return jsonify({'error': 'Invalid order total amount'}), 400

        user = order.user
        customer_name = user.name if (user and user.name) else "Customer"
        customer_email = user.email if (user and user.email) else f"customer_{order.id}@sdjewels.com"
        customer_phone = user.phone if (user and user.phone) else "9999999999"

        # Create Razorpay order via Razorpay service
        rzp_order = razorpay_service.create_order(
            order_id=order.id,
            amount=amount,
            currency='INR',
            notes={
                "customer_name": customer_name,
                "customer_email": customer_email,
                "customer_phone": customer_phone,
            }
        )

        razorpay_order_id = rzp_order.get('id')
        if not razorpay_order_id:
            logger.error(f"Failed to obtain Razorpay order ID from response: {rzp_order}")
            return jsonify({'error': 'Failed to create payment order with gateway'}), 500

        # Check if a payment record already exists for this order
        payment = Payment.query.filter_by(order_id=order.id, gateway='RAZORPAY', status='PENDING').first()
        if payment:
            payment.gateway_order_id = razorpay_order_id
            payment.amount = amount
            payment.gateway_response = json.dumps(rzp_order)
        else:
            payment = Payment(
                order_id=order.id,
                user_id=user.id if user else None,
                gateway_order_id=razorpay_order_id,
                amount=amount,
                currency='INR',
                status='PENDING',
                gateway='RAZORPAY',
                gateway_response=json.dumps(rzp_order)
            )
            db.session.add(payment)

        # Update order payment_method
        order.payment_method = 'Razorpay'
        db.session.commit()

        logger.info(f"Created Razorpay order {razorpay_order_id} for internal order #{order.id}")

        return jsonify({
            'order_id': order.id,
            'razorpay_order_id': razorpay_order_id,
            'amount': rzp_order.get('amount', int(round(amount * 100))),
            'amount_inr': amount,
            'currency': rzp_order.get('currency', 'INR'),
            'key_id': razorpay_service.key_id,
            'customer': {
                'name': customer_name,
                'email': customer_email,
                'phone': customer_phone
            },
            'business_name': 'SD Jewels',
            'description': f'SD Jewels Order #{order.id}'
        }), 200

    except Exception as e:
        logger.exception("Error in create_payment_order")
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/verify', methods=['POST'])
@payments_bp.route('/razorpay/verify', methods=['POST'])
def verify_payment():
    """
    Verifies payment signature sent from frontend Razorpay checkout modal.
    Authenticates HMAC-SHA256 signature, updates Payment and Order records to SUCCESS/Processing,
    and triggers customer confirmation email.
    """
    try:
        data = request.json or {}
        internal_order_id = data.get('order_id')
        razorpay_order_id = data.get('razorpay_order_id', '').strip()
        razorpay_payment_id = data.get('razorpay_payment_id', '').strip()
        razorpay_signature = data.get('razorpay_signature', '').strip()

        if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
            return jsonify({
                'success': False,
                'error': 'Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature'
            }), 400

        # Cryptographically verify signature
        is_valid = razorpay_service.verify_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )

        if not is_valid:
            logger.warning(f"Razorpay signature verification failed for order {razorpay_order_id}")
            payment = Payment.query.filter_by(gateway_order_id=razorpay_order_id).first()
            if payment:
                payment.status = 'FAILED'
                payment.gateway_payment_id = razorpay_payment_id
                payment.gateway_response = json.dumps(data)
                db.session.commit()

            return jsonify({
                'success': False,
                'error': 'Payment verification failed: Invalid cryptographic signature'
            }), 400

        # Locate Payment record in DB
        payment = Payment.query.filter_by(gateway_order_id=razorpay_order_id).first()
        if not payment and internal_order_id:
            payment = Payment.query.filter_by(order_id=internal_order_id, gateway='RAZORPAY').order_by(Payment.created_at.desc()).first()

        # Fetch payment details from Razorpay to identify payment method (UPI, Card, NetBanking, etc.)
        payment_method_name = "Online"
        try:
            rzp_payment_details = razorpay_service.fetch_payment(razorpay_payment_id)
            if rzp_payment_details:
                raw_method = rzp_payment_details.get("method", "Online")
                if raw_method == "upi":
                    vpa = rzp_payment_details.get("vpa", "")
                    payment_method_name = f"UPI ({vpa})" if vpa else "UPI"
                elif raw_method == "card":
                    card_network = rzp_payment_details.get("card", {}).get("network", "Card")
                    card_last4 = rzp_payment_details.get("card", {}).get("last4", "")
                    payment_method_name = f"Card ({card_network} ****{card_last4})" if card_last4 else "Card"
                elif raw_method == "netbanking":
                    bank = rzp_payment_details.get("bank", "NetBanking")
                    payment_method_name = f"NetBanking ({bank})"
                elif raw_method == "wallet":
                    wallet = rzp_payment_details.get("wallet", "Wallet")
                    payment_method_name = f"Wallet ({wallet})"
                else:
                    payment_method_name = raw_method.capitalize()
        except Exception as ex:
            logger.warning(f"Could not fetch payment method details for {razorpay_payment_id}: {ex}")

        # Update Payment record
        if payment:
            payment.status = 'SUCCESS'
            payment.gateway_payment_id = razorpay_payment_id
            payment.payment_session_id = razorpay_signature
            payment.payment_method = f"Razorpay {payment_method_name}"
            payment.gateway_response = json.dumps(data)

            order = payment.order
            if order:
                order.status = 'Processing'
                order.payment_method = f"Razorpay ({payment_method_name})"

            db.session.commit()

            # Trigger email notification
            try:
                from app import notify_customer_order_verified
                if order and order.user:
                    notify_customer_order_verified(order, order.user)
            except Exception as mail_err:
                logger.error(f"Error sending order confirmation email: {mail_err}")

            resolved_order_id = order.id if order else internal_order_id
            logger.info(f"Payment verified successfully for Order #{resolved_order_id}, payment_id: {razorpay_payment_id}")
            return jsonify({
                'success': True,
                'message': 'Payment verified successfully',
                'order_id': resolved_order_id,
                'status': 'Processing',
                'payment_id': razorpay_payment_id
            }), 200
        else:
            # Fallback if payment record was not pre-created
            logger.warning(f"Payment record not found for {razorpay_order_id}, checking order_id {internal_order_id}")
            if internal_order_id:
                order = db.session.get(Order, internal_order_id)
                if order:
                    order.status = 'Processing'
                    order.payment_method = f"Razorpay ({payment_method_name})"
                    new_payment = Payment(
                        order_id=order.id,
                        user_id=order.user_id,
                        gateway_order_id=razorpay_order_id,
                        gateway_payment_id=razorpay_payment_id,
                        payment_session_id=razorpay_signature,
                        amount=order.total_amount,
                        currency='INR',
                        status='SUCCESS',
                        payment_method=f"Razorpay {payment_method_name}",
                        gateway='RAZORPAY',
                        gateway_response=json.dumps(data)
                    )
                    db.session.add(new_payment)
                    db.session.commit()

                    try:
                        from app import notify_customer_order_verified
                        if order.user:
                            notify_customer_order_verified(order, order.user)
                    except Exception as mail_err:
                        logger.error(f"Error sending order confirmation email: {mail_err}")

                    return jsonify({
                        'success': True,
                        'message': 'Payment verified successfully',
                        'order_id': order.id,
                        'status': 'Processing',
                        'payment_id': razorpay_payment_id
                    }), 200

            return jsonify({
                'success': False,
                'error': 'Payment record or order not found'
            }), 404

    except Exception as e:
        logger.exception("Error in verify_payment")
        return jsonify({'success': False, 'error': str(e)}), 500


@payments_bp.route('/webhook', methods=['POST'])
@payments_bp.route('/razorpay/webhook', methods=['POST'])
def razorpay_webhook():
    """
    Asynchronous Razorpay Server-to-Server Webhook handler.
    Ensures order status reconciliation even if the customer closes the browser window
    immediately after paying.
    """
    try:
        raw_body = request.get_data()
        signature = request.headers.get('X-Razorpay-Signature', '').strip()

        if not signature:
            logger.warning("Razorpay Webhook received without X-Razorpay-Signature header.")
            return jsonify({'error': 'Missing signature'}), 400

        # Verify webhook signature
        is_valid = razorpay_service.verify_webhook_signature(raw_body, signature)
        if not is_valid:
            logger.error("Razorpay webhook signature verification failed.")
            return jsonify({'error': 'Invalid signature'}), 400

        payload = json.loads(raw_body.decode('utf-8'))
        event = payload.get('event', '')
        logger.info(f"Received authentic Razorpay webhook event: {event}")

        event_payload = payload.get('payload', {})
        payment_entity = event_payload.get('payment', {}).get('entity', {})
        order_entity = event_payload.get('order', {}).get('entity', {})

        rzp_order_id = payment_entity.get('order_id') or order_entity.get('id')
        rzp_payment_id = payment_entity.get('id')
        method = payment_entity.get('method', 'Online')

        if not rzp_order_id:
            logger.warning("No order_id found in webhook payload")
            return jsonify({'status': 'OK', 'message': 'No order_id present'}), 200

        # Find payment record in DB
        payment = Payment.query.filter_by(gateway_order_id=rzp_order_id).first()
        if not payment:
            logger.warning(f"Payment record for {rzp_order_id} not found in DB")
            return jsonify({'status': 'OK', 'message': 'Payment record not found'}), 200

        # Idempotency check: If already SUCCESS, return immediately
        if payment.status == 'SUCCESS':
            logger.info(f"Webhook: payment {rzp_order_id} already marked SUCCESS. Skipping.")
            return jsonify({'status': 'OK', 'message': 'Already processed'}), 200

        order = payment.order
        if event in ['payment.captured', 'order.paid']:
            payment.status = 'SUCCESS'
            if rzp_payment_id:
                payment.gateway_payment_id = rzp_payment_id
            payment.payment_method = f"Razorpay ({method.upper()})"
            payment.gateway_response = json.dumps(payload)

            if order:
                order.status = 'Processing'
                order.payment_method = f"Razorpay ({method.upper()})"

            db.session.commit()

            # Trigger email
            try:
                from app import notify_customer_order_verified
                if order and order.user:
                    notify_customer_order_verified(order, order.user)
            except Exception as mail_err:
                logger.error(f"Error sending email on webhook: {mail_err}")

            logger.info(f"Updated Payment {rzp_order_id} and Order #{order.id if order else 'N/A'} to SUCCESS via Webhook")

        elif event in ['payment.failed']:
            payment.status = 'FAILED'
            if rzp_payment_id:
                payment.gateway_payment_id = rzp_payment_id
            payment.gateway_response = json.dumps(payload)
            db.session.commit()
            logger.info(f"Payment {rzp_order_id} marked as FAILED via Webhook")

        return jsonify({'status': 'OK'}), 200

    except Exception as e:
        logger.exception("Error processing Razorpay webhook")
        return jsonify({'error': 'Webhook processing error'}), 500


@payments_bp.route('/<int:order_id>/status', methods=['GET'])
def get_payment_status(order_id):
    """
    Returns payment and order status for an internal order.
    """
    try:
        order = db.session.get(Order, order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        latest_payment = Payment.query.filter_by(order_id=order_id).order_by(Payment.created_at.desc()).first()

        # Compute status
        if latest_payment:
            pay_status = latest_payment.status
            pay_method = latest_payment.payment_method or order.payment_method
            gateway_order_id = latest_payment.gateway_order_id
            gateway_payment_id = latest_payment.gateway_payment_id
        else:
            pay_status = 'SUCCESS' if order.status in ['Processing', 'Shipped', 'Completed', 'Paid'] else 'PENDING'
            pay_method = order.payment_method
            gateway_order_id = None
            gateway_payment_id = None

        return jsonify({
            'order_id': order.id,
            'payment_status': pay_status,
            'amount': order.total_amount,
            'currency': 'INR',
            'payment_method': pay_method,
            'gateway_order_id': gateway_order_id,
            'gateway_payment_id': gateway_payment_id,
            'razorpay_order_id': gateway_order_id,
            'razorpay_payment_id': gateway_payment_id
        }), 200

    except Exception as e:
        logger.exception("Error in get_payment_status")
        return jsonify({'error': 'Failed to retrieve payment status'}), 500
