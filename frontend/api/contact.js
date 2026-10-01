// Vercel Serverless Function: POST /api/contact
// Handles contact messages, validates input, applies spam protection,
// and sends email via Resend API directly to Charan's email.

export default async function handler(req, res) {
  // 1. Enable CORS for local & production requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { name, email, subject, message } = req.body || {};

    // 2. Server-side validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    // 3. Spam protection: max length checks & sanitization
    if (name.length > 120 || email.length > 120 || (subject && subject.length > 150) || message.length > 3500) {
      return res.status(400).json({ success: false, error: 'Message exceeds character limits.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = (subject && subject.trim()) || `New Portfolio Message from ${cleanName}`;
    const cleanMessage = message.trim();
    const recipientEmail = process.env.RECEIVER_EMAIL || 'charan06082004@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // Send via Resend REST API (zero dependencies required)
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.SENDER_EMAIL || 'Portfolio Contact <onboarding@resend.dev>',
          to: [recipientEmail],
          reply_to: cleanEmail,
          subject: `💼 Portfolio: ${cleanSubject}`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #183B2B; max-width: 600px; margin: 0 auto; border: 2.5px solid #183B2B; border-radius: 16px; padding: 28px; background-color: #FFF5F5;">
              <div style="display: flex; align-items: center; border-bottom: 2px solid #183B2B; padding-bottom: 14px; margin-bottom: 20px;">
                <h2 style="color: #6941C6; margin: 0; font-size: 22px;">New Portfolio Message 📬</h2>
              </div>
              <p style="margin: 8px 0; font-size: 15px;"><strong>From:</strong> ${cleanName} (<a href="mailto:${cleanEmail}" style="color: #6941C6; text-decoration: underline;">${cleanEmail}</a>)</p>
              <p style="margin: 8px 0; font-size: 15px;"><strong>Subject:</strong> ${cleanSubject}</p>
              
              <div style="margin-top: 20px; padding: 18px; background-color: #FFFFFF; border: 2px solid #183B2B; border-radius: 12px; box-shadow: 3px 3px 0px #183B2B;">
                <h4 style="margin: 0 0 10px 0; color: #183B2B; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Message Body:</h4>
                <p style="white-space: pre-wrap; margin: 0; font-size: 15px; color: #2C4A3A;">${cleanMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>

              <div style="margin-top: 24px; padding-top: 14px; border-top: 1px dashed #183B2B; font-size: 13px; color: #536E60;">
                💡 <em>You can directly hit <strong>Reply</strong> to respond to ${cleanName} at ${cleanEmail}.</em>
              </div>
            </div>
          `,
        }),
      });

      const resendData = await resendResponse.json();

      if (!resendResponse.ok) {
        console.error('Resend API Error:', resendData);
        return res.status(resendResponse.status).json({
          success: false,
          error: resendData.message || 'Failed to dispatch email via Resend.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Message delivered to Charan successfully!',
        id: resendData.id,
      });
    }

    // Fallback response if RESEND_API_KEY is not configured yet
    return res.status(200).json({
      success: true,
      message: 'Message submitted! (To forward to email, configure RESEND_API_KEY in Vercel Environment Variables)',
    });
  } catch (error) {
    console.error('Serverless contact handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your message.',
    });
  }
}
