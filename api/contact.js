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
          html: generatePortfolioEmailHtml({ cleanName, cleanEmail, cleanSubject, cleanMessage }),
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

export function generatePortfolioEmailHtml({ cleanName, cleanEmail, cleanSubject, cleanMessage }) {
  const replyUrl = `mailto:${cleanEmail}?subject=Re: ${encodeURIComponent(cleanSubject)}`;
  const timestamp = new Date().toUTCString();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Message from ${cleanName}</title>
</head>
<body style="margin: 0; padding: 32px 14px; background-color: #06070B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #FFFFFF;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #06070B; width: 100%; margin: 0 auto;">
    <tr>
      <td align="center">
        <!-- Main Cyber Card Container (Matching Charan Portfolio Card Design) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #0D0F18; border: 2px solid #FF1E27; border-radius: 14px; overflow: hidden; box-shadow: 0 14px 40px rgba(0, 0, 0, 0.9), 0 0 24px rgba(255, 30, 39, 0.3);">
          
          <!-- Cyber Card Ribbon Header -->
          <tr>
            <td style="background-color: #121524; padding: 22px 28px; border-bottom: 2px solid #FF1E27;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 11px; letter-spacing: 0.16em; color: #FF4D55; font-weight: 700; text-transform: uppercase;">[PORTFOLIO // DIRECT INQUIRY]</span>
                    <h1 style="margin: 6px 0 0 0; font-size: 21px; font-weight: 900; letter-spacing: 0.04em; color: #FFFFFF; text-transform: uppercase;">
                      INCOMING MESSAGE <span style="color: #FF1E27;">■</span>
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; color: #4ade80; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; font-family: monospace; letter-spacing: 0.08em; text-transform: uppercase;">
                      ● DISPATCHED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Transmission Coordinates Grid -->
          <tr>
            <td style="padding: 22px 28px 16px 28px; background-color: #0F121E;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #94A3B8; text-transform: uppercase; width: 110px;">
                    SENDER:
                  </td>
                  <td style="padding: 6px 0; font-size: 15px; color: #FFFFFF; font-weight: 800;">
                    ${cleanName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #94A3B8; text-transform: uppercase;">
                    EMAIL:
                  </td>
                  <td style="padding: 6px 0; font-size: 15px;">
                    <a href="mailto:${cleanEmail}" style="color: #FF4D55; font-weight: 700; text-decoration: none; border-bottom: 1px dotted #FF4D55;">${cleanEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #94A3B8; text-transform: uppercase;">
                    SUBJECT:
                  </td>
                  <td style="padding: 6px 0; font-size: 15px; color: #E2E8F0; font-weight: 600;">
                    ${cleanSubject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #94A3B8; text-transform: uppercase;">
                    DISPATCHED:
                  </td>
                  <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: #64748B;">
                    ${timestamp}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Payload Inner Card (Matching Cyber Card Frame) -->
          <tr>
            <td style="padding: 22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #06070C; border: 1.5px solid rgba(255, 30, 39, 0.45); border-radius: 10px; overflow: hidden;">
                <tr>
                  <td style="background-color: rgba(255, 30, 39, 0.08); padding: 9px 18px; border-bottom: 1px solid rgba(255, 30, 39, 0.25);">
                    <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #FF6B72; letter-spacing: 0.12em; text-transform: uppercase;">
                      // TRANSMITTED PAYLOAD
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 22px 18px; color: #F1F5F9; font-size: 15px; line-height: 1.65; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${cleanMessage}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Direct Reply Action CTA -->
          <tr>
            <td style="padding: 4px 28px 24px 28px;" align="center">
              <a href="${replyUrl}" style="display: inline-block; background-color: #FF1E27; background-image: linear-gradient(135deg, #FF2E36 0%, #C80810 100%); color: #FFFFFF; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; text-decoration: none; padding: 13px 30px; border-radius: 8px; box-shadow: 0 4px 18px rgba(255, 30, 39, 0.45); font-family: sans-serif;">
                REPLY TO ${cleanName.toUpperCase()} ↗
              </a>
            </td>
          </tr>

          <!-- Cyber Baseline Footer -->
          <tr>
            <td style="background-color: #090B12; padding: 18px 28px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 700; color: #94A3B8; font-family: monospace; letter-spacing: 0.08em;">
                CHARAN SAI BARNIKANI // PORTFOLIO
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748B;">
                Full-Stack Systems Architect & AI/ML Engineer • <a href="mailto:charan06082004@gmail.com" style="color: #FF4D55; text-decoration: none;">charan06082004@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
