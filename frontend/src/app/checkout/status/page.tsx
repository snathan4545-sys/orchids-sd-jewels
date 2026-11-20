"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, ArrowLeft, Home, ShoppingCart } from 'lucide-react';
import styles from './OrdersStatus.module.css';
import { API_BASE_URL, BASE_URL } from '@/config';


export default function OrderStatusPage() {
  const [order, setOrder] = useState<any | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let orderIdStr = params.get('order_id');

    if (!orderIdStr) {
      setError("No Order ID provided in URL parameters.");
      setLoading(false);
      return;
    }

    let numericOrderId = orderIdStr;
    if (orderIdStr.includes('_')) {
      const parts = orderIdStr.split('_');
      const foundNumeric = parts.find((p) => /^\d+$/.test(p));
      if (foundNumeric) {
        numericOrderId = foundNumeric;
      }
    }

    const verifyAndFetchOrder = async () => {
      try {
        // Step 1: Query backend payment status API
        const payRes = await fetch(`${API_BASE_URL}/payments/${numericOrderId}/status`);
        let payData = null;
        if (payRes.ok) {
          payData = await payRes.json();
          setPaymentInfo(payData);
        }

        // Step 2: Query order details API
        const orderRes = await fetch(`${API_BASE_URL}/orders/${numericOrderId}`);
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrder(orderData);
        } else {
          setError(`Order #${numericOrderId} was not found on the server.`);
        }
      } catch (err) {
        console.error("Error fetching order status:", err);
        setError("Failed to connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchOrder();

    // Auto poll up to 3 times if status is PENDING
    const interval = setInterval(() => {
      verifyAndFetchOrder();
    }, 4000);

    const timer = setTimeout(() => {
      clearInterval(interval);
    }, 12000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <main style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.loading}>
            <Clock size={40} style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem', color: '#ce967e' }} />
            <p>Retrieving your order status details...</p>
          </div>
        </main>
        
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <main style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.errorState}>
            <XCircle size={60} style={{ color: '#f04438', marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Status Lookup Failed</h2>
            <p style={{ color: '#888582', marginBottom: '2.5rem' }}>{error || 'Unable to retrieve order details.'}</p>
            <div className={styles.actions}>
              <Link href="/" className={styles.primaryBtn}>
                <Home size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        
      </div>
    );
  }

  const actualStatus = paymentInfo?.payment_status || (order.status === 'Processing' || order.status === 'Completed' ? 'SUCCESS' : order.status);
  const isSuccess = actualStatus === 'SUCCESS' || order.status === 'Processing' || order.status === 'Completed';
  const isDeclined = actualStatus === 'FAILED' || actualStatus === 'CANCELLED' || order.status === 'Declined';
  const isPending = !isSuccess && !isDeclined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <main style={{ flex: '1', backgroundColor: '#faf8f6', paddingBottom: '4rem' }}>
        <div className={styles.container}>
          <div className={styles.card}>
            {/* Header Banner */}
            {isSuccess && (
              <div className={`${styles.banner} ${styles.successBanner}`}>
                <CheckCircle2 size={50} />
                <h1>Order Placed Successfully!</h1>
                <p>Payment has been verified. Thank you for your purchase!</p>
              </div>
            )}

            {isDeclined && (
              <div className={`${styles.banner} ${styles.failedBanner}`}>
                <XCircle size={50} />
                <h1>Order Failed</h1>
                <p>Reason: Payment not done.</p>
              </div>
            )}

            {isPending && (
              <div className={`${styles.banner} ${styles.pendingBanner}`}>
                <Clock size={50} />
                <h1>Payment Verification Pending</h1>
                <p>We are checking your payment and will update you shortly.</p>
              </div>
            )}

            {/* Body */}
            <div className={styles.body}>
              <h4 className={styles.sectionTitle}>Order Information</h4>
              <div className={styles.detailsGrid}>
                <div className={styles.infoBlock}>
                  <label>Order ID</label>
                  <span>#{order.id}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Payment Method</label>
                  <span>{order.payment_method || 'UPI Payment'}</span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Verification Status</label>
                  <span style={{ 
                    color: isSuccess ? '#12b76a' : isDeclined ? '#f04438' : '#f59e0b',
                    textTransform: 'uppercase',
                    fontSize: '0.85rem'
                  }}>
                    {order.status === 'Processing' ? 'Verified' : order.status}
                  </span>
                </div>
                <div className={styles.infoBlock}>
                  <label>Customer Details</label>
                  <span>
                    {order.user?.name || 'Customer'}<br />
                    <span style={{ fontWeight: 400, color: '#888582', fontSize: '0.8rem' }}>{order.user?.email}</span>
                  </span>
                </div>
              </div>

              {/* Items List */}
              <h4 className={styles.sectionTitle}>Items Ordered</h4>
              <div className={styles.itemsList}>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemLeft}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemMeta}>Metal: {item.metal} | Qty: {item.quantity}</span>
                      </div>
                      <div className={styles.itemPrice}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#888582', margin: 0 }}>
                    No products list found in database records.
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className={styles.summarySection}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{order.total_amount}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span style={{ color: '#12b76a', fontWeight: '500' }}>Free</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Grand Total</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                {isDeclined ? (
                  <>
                    <Link href="/checkout" className={styles.primaryBtn}>
                      <ShoppingCart size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                      Retry Checkout
                    </Link>
                    <Link href="/" className={styles.secondaryBtn}>
                      Back to Store
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/" className={styles.primaryBtn}>
                      Continue Shopping
                    </Link>
                    <Link href="/profile" className={styles.secondaryBtn}>
                      My Profile
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}
