import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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


    const result = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${recipientPhoneNumber}`,
      body: message,
    });

    return { success: true, messageSid: result.sid };
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
    throw new Error(`Failed to send WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
