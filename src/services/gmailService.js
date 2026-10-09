/**
 * Service to interact with the Gmail API on behalf of the authenticated user
 */
export const gmailService = {
  /**
   * Helper to format RFC 2822 email message encoded in URL-safe base64
   */
  createEmailBody({ to, from, subject, bodyHtml }) {
    const emailLines = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyHtml,
    ];

    const email = emailLines.join('\r\n');
    return btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  },

  /**
   * Send an Order Confirmation email via Gmail API
   */
  async sendOrderConfirmationEmail(accessToken, { to, from, order }) {
    if (!accessToken) {
      throw new Error('No access token available. Please sign in with Google to enable Gmail features.');
    }

    const itemsRows = (order.items || [])
      .map(
        (i) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${i.price}</td>
        </tr>
      `
      )
      .join('');

    const bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0A0A0A; padding: 20px; border-radius: 12px 12px 0 0; color: #fff;">
          <h1 style="color: #84CC16; margin: 0; font-size: 24px;">Indicart Order Confirmation</h1>
          <p style="margin: 5px 0 0 0; color: #bbb; font-size: 13px;">Order #${order.orderId}</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi <strong>${order.userName || 'Shopper'}</strong>,</p>
          <p>Thank you for shopping with <strong>Indicart</strong>! Your order has been placed successfully.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr style="background: #f8f8f8; color: #555;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px; font-weight: bold; text-align: right;">Total Amount:</td>
                <td style="padding: 8px; font-weight: bold; text-align: right; color: #0A0A0A; font-size: 16px;">₹${order.total}</td>
              </tr>
            </tfoot>
          </table>

          <p style="font-size: 13px; color: #666;">
            <strong>Shipping to:</strong><br />
            ${order.address?.fullName || ''}<br />
            ${order.address?.address || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.postalCode || ''}<br />
            Phone: ${order.address?.phone || ''}
          </p>

          <p style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; pt: 15px;">
            This email was sent from your Indicart store application via Gmail.
          </p>
        </div>
      </div>
    `;

    const rawMessage = this.createEmailBody({
      to,
      from: from || 'me',
      subject: `Order Confirmation - #${order.orderId} (Indicart)`,
      bodyHtml,
    });

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawMessage }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Failed to send email (Status ${res.status})`);
    }

    return await res.json();
  },

  /**
   * Fetch recent messages/receipts sent or received
   */
  async listMessages(accessToken, query = 'Indicart') {
    if (!accessToken) return [];
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  },
};
