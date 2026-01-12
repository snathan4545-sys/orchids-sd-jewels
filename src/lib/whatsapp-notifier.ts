export async function sendOrderNotification(
  recipientPhoneNumber: string,
    orderDetails: {
      orderId: string;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      address: string;
      totalPrice: number;
      items: Array<{ name: string; quantity: number; price: number; selectedColor?: string; selectedSize?: string }>;
    }
) {
  try {
    const itemsList = orderDetails.items
      .map((item) => {
        let itemText = `• ${item.name} x${item.quantity}: ₹${item.price * item.quantity}`;
        if (item.selectedColor) itemText += ` (Color: ${item.selectedColor})`;
        if (item.selectedSize) itemText += ` (Size: ${item.selectedSize})`;
        return itemText;
      })
      .join('\n');

    const message = `🎉 New Order Received!\n\nOrder ID: ${orderDetails.orderId}\n\nCustomer: ${orderDetails.customerName}\nPhone: ${orderDetails.customerPhone}${orderDetails.customerEmail ? `\nEmail: ${orderDetails.customerEmail}` : ''}\n\nAddress:\n${orderDetails.address}\n\nItems:\n${itemsList}\n\nTotal Amount: ₹${orderDetails.totalPrice}\n\n---\nSD Trends`;

    // Since the user requested "No need twilio" and "Customer should not be taken to WhatsApp",
    // and we cannot send automated WhatsApp messages without an API key (like Twilio, Interakt, or WhatsApp Cloud API),
    // we are logging the order details for the admin.
    // To implement background WhatsApp notifications, you will need a WhatsApp API service.
    
    console.log('--- ADMIN ORDER NOTIFICATION (WHATSAPP PENDING) ---');
    console.log(`To: ${recipientPhoneNumber}`);
    console.log(message);
    console.log('----------------------------------------------------');

    return { success: true, logged: true };
  } catch (error) {
    console.error('Notification logic failed:', error);
    throw new Error(`Failed to process notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
