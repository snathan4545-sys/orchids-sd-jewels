import json
import time
import logging
from flask import Blueprint, request, jsonify
from models import db, Order, User, Payment
from services.cashfree_service import cashfree_service

logger = logging.getLogger(__name__)

payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

@payments_bp.route('/create-order', methods=['POST'])
def create_payment_order():
    """
    Creates a Cashfree payment order for an existing internal order.
    Amount is strictly retrieved from the database to prevent manipulation.
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
        customer_id = str(user.id if user else f"guest_{order.id}")
        customer_name = user.name if (user and user.name) else "Customer"
        customer_email = user.email if (user and user.email) else f"customer_{order.id}@sdtrends.com"
        customer_phone = user.phone if (user and user.phone) else "9999999999"

        # Unique Cashfree Order ID
        cashfree_order_id = f"CF_ORD_{order.id}_{int(time.time())}"

        # Call Cashfree PG Service
        cf_response = cashfree_service.create_order(
            cashfree_order_id=cashfree_order_id,
            amount=amount,
            customer_id=customer_id,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone
        )

        payment_session_id = cf_response.get('payment_session_id')
        if not payment_session_id:
            logger.error(f"Missing payment_session_id in Cashfree response: {cf_response}")
            return jsonify({'error': 'Failed to obtain payment session from gateway'}), 502

        # Save Payment record in Database
        payment = Payment(
            order_id=order.id,
            user_id=user.id if user else None,
            cashfree_order_id=cashfree_order_id,
            payment_session_id=payment_session_id,
            amount=amount,
            currency='INR',
            status='PENDING',
            gateway='CASHFREE',
            gateway_response=json.dumps(cf_response)
        )
        db.session.add(payment)
        
        # Update order payment_method
        order.payment_method = 'Cashfree Payments'
        db.session.commit()

        logger.info(f"Created Cashfree order {cashfree_order_id} for internal order #{order.id}")

        return jsonify({
            'payment_session_id': payment_session_id,
            'cashfree_order_id': cashfree_order_id,
            'order_id': order.id,
            'environment': cashfree_service.environment
        }), 200

    except Exception as e:
        logger.exception("Error in create_payment_order")
        return jsonify({'error': str(e)}), 500


@payments_bp.route('/<int:order_id>/status', methods=['GET'])
def get_payment_status(order_id):
    """
    Returns verified payment status for an internal order.
    Also verifies status with Cashfree if locally PENDING.
    """
    try:
        order = db.session.get(Order, order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        latest_payment = Payment.query.filter_by(order_id=order_id).order_by(Payment.created_at.desc()).first()

        # If payment exists and is PENDING, double-check with Cashfree API
        if latest_payment and latest_payment.status == 'PENDING' and cashfree_service.is_configured():
            try:
                cf_order = cashfree_service.get_order_status(latest_payment.cashfree_order_id)
                cf_status = cf_order.get('order_status')
                
                if cf_status == 'PAID':
                    latest_payment.status = 'SUCCESS'
                    order.status = 'Processing'
                    
                    # Fetch payment details if available
                    payments_list = cashfree_service.get_order_payments(latest_payment.cashfree_order_id)
                    if payments_list and len(payments_list) > 0:
                        succ_p = payments_list[0]
                        latest_payment.cashfree_payment_id = str(succ_p.get('cf_payment_id', ''))
                        latest_payment.payment_method = succ_p.get('payment_group', 'ONLINE')
                    
                    db.session.commit()
                elif cf_status in ['EXPIRED', 'CANCELLED', 'TERMINATED']:
                    latest_payment.status = 'FAILED'
                    db.session.commit()
            except Exception as ex:
                logger.error(f"Error checking Cashfree gateway status: {ex}")

        # Compute response status
        if latest_payment:
            pay_status = latest_payment.status
            pay_method = latest_payment.payment_method or order.payment_method
        else:
            pay_status = 'SUCCESS' if order.status in ['Processing', 'Shipped', 'Completed', 'Paid'] else 'PENDING'
            pay_method = order.payment_method

        return jsonify({
            'order_id': order.id,
            'payment_status': pay_status,
            'amount': order.total_amount,
            'currency': 'INR',
            'payment_method': pay_method,
            'cashfree_order_id': latest_payment.cashfree_order_id if latest_payment else None
        }), 200

    except Exception as e:
        logger.exception("Error in get_payment_status")
        return jsonify({'error': 'Failed to retrieve payment status'}), 500


@payments_bp.route('/webhook/cashfree', methods=['POST'])
def cashfree_webhook():
    """
    Asynchronous Cashfree Webhook handler.
    Verifies HMAC signature, updates Payment and Order statuses idempotently.
    """
    raw_body = request.get_data()
    timestamp = request.headers.get('x-webhook-timestamp', '')
    signature = request.headers.get('x-webhook-signature', '')

    logger.info(f"Received Cashfree webhook request. Timestamp: {timestamp}")

    # Verify Webhook authenticity
    if not cashfree_service.verify_webhook_signature(raw_body, timestamp, signature):
        logger.warning("Cashfree webhook signature verification failed!")
        return jsonify({'error': 'Invalid webhook signature'}), 401

    try:
        payload = request.json or {}
        logger.info(f"Webhook payload: {json.dumps(payload)}")

        data = payload.get('data', {})
        order_info = data.get('order', {})
        payment_info = data.get('payment', {})

        cashfree_order_id = order_info.get('order_id') or payload.get('order_id')
        event_type = payload.get('type')

        if not cashfree_order_id:
            logger.error("No cashfree_order_id in webhook payload")
            return jsonify({'error': 'Invalid payload format'}), 400

        # Find Payment record in DB
        payment = Payment.query.filter_by(cashfree_order_id=cashfree_order_id).first()
        if not payment:
            logger.warning(f"Payment record for {cashfree_order_id} not found in DB")
            return jsonify({'status': 'OK', 'message': 'Payment record not found'}), 200

        # Idempotency check: If already processed SUCCESS, return immediately
        if payment.status == 'SUCCESS':
            logger.info(f"Duplicate webhook received for already successful payment {cashfree_order_id}")
            return jsonify({'status': 'OK', 'message': 'Already processed'}), 200

        order = payment.order
        payment_status = payment_info.get('payment_status') or order_info.get('order_status')

        if event_type == 'PAYMENT_SUCCESS_WEBHOOK' or payment_status == 'SUCCESS' or payment_status == 'PAID':
            payment.status = 'SUCCESS'
            payment.cashfree_payment_id = str(payment_info.get('cf_payment_id', ''))
            payment.payment_method = payment_info.get('payment_group', 'ONLINE')
            payment.gateway_response = json.dumps(payload)
            
            if order:
                order.status = 'Processing'
                order.payment_method = f"Cashfree ({payment.payment_method})"

            db.session.commit()
            logger.info(f"Successfully updated Payment {cashfree_order_id} and Order #{order.id if order else 'N/A'} to SUCCESS")

        elif event_type in ['PAYMENT_FAILED_WEBHOOK', 'PAYMENT_USER_DROPPED_WEBHOOK'] or payment_status == 'FAILED':
            payment.status = 'FAILED'
            payment.gateway_response = json.dumps(payload)
            db.session.commit()
            logger.info(f"Payment {cashfree_order_id} marked as FAILED")

        return jsonify({'status': 'OK'}), 200

    except Exception as e:
        logger.exception("Error processing Cashfree webhook")
        return jsonify({'error': 'Webhook processing internal error'}), 500
