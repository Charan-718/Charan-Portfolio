import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Charan Portfolio Contact Backend API' });
});

// Contact Route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = (subject && subject.trim()) || `New Portfolio Message from ${cleanName}`;
    const cleanMessage = message.trim();
    const recipientEmail = process.env.RECEIVER_EMAIL || 'charan06082004@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
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

      const resendData = await resendRes.json();
      if (!resendRes.ok) {
        console.error('Resend API Error:', resendData);
        return res.status(resendRes.status).json({ success: false, error: resendData.message || 'Email dispatch failed.' });
      }

      return res.status(200).json({ success: true, message: 'Message delivered to Charan successfully!' });
    }

    console.log(`[Contact Form Received] Name: ${cleanName}, Email: ${cleanEmail}, Subject: ${cleanSubject}`);
    return res.status(200).json({
      success: true,
      message: 'Message received! (Set RESEND_API_KEY in .env to dispatch live emails)',
    });
  } catch (error) {
    console.error('Express contact endpoint error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

function generatePortfolioEmailHtml({ cleanName, cleanEmail, cleanSubject, cleanMessage }) {
  const replyUrl = `mailto:${cleanEmail}?subject=Re: ${encodeURIComponent(cleanSubject)}`;
  const timestamp = new Date().toUTCString();
  const year = new Date().getFullYear();
  const sanitizedMessage = cleanMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Message from ${cleanName}</title>
</head>
<body style="margin: 0; padding: 28px 12px; background-color: #06070B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #FFFFFF;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #06070B; width: 100%; margin: 0 auto;">
    <tr>
      <td align="center">
        <!-- Main Cyber Card Container (Matching Charan Portfolio Card Design) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #0C0E17; border: 2px solid #FF1E27; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.95), 0 0 28px rgba(255, 30, 39, 0.35);">
          
          <!-- Top Technical System Strip -->
          <tr>
            <td style="background-color: #05060A; padding: 9px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 10px; color: #94A3B8; letter-spacing: 0.12em; text-transform: uppercase;">
                    <span style="color: #22C55E; font-weight: 800;">●</span> SYSTEM_NODE // DIRECT INQUIRY GATEWAY
                  </td>
                  <td align="right" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 10px; color: #FF4D55; letter-spacing: 0.1em; font-weight: 700;">
                    LIVE DISPATCH
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cyber Card Brand Header Zone (718 Logo + Portfolio Title) -->
          <tr>
            <td style="background-color: #111422; padding: 22px 24px; border-bottom: 2px solid #FF1E27;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- 718 Geometric Logo Emblem -->
                  <td width="42" style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="38" height="38" align="center" style="background-color: #FF1E27; color: #FFFFFF; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 16px; font-weight: 900; letter-spacing: -0.05em; border-radius: 3px; box-shadow: 0 0 12px rgba(255, 30, 39, 0.6);">
                          718
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding-left: 14px; vertical-align: middle;">
                    <div style="font-size: 17px; font-weight: 900; letter-spacing: -0.02em; color: #FFFFFF; text-transform: uppercase; line-height: 1.1;">
                      CHARAN<span style="color: #FF1E27;">.</span>
                    </div>
                    <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #94A3B8; letter-spacing: 0.12em; font-weight: 600; margin-top: 3px;">
                      AIML &amp; FULL-STACK SYSTEMS ARCHITECT
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #FF1E27; color: #FFFFFF; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 5px 11px; border-radius: 2px; text-transform: uppercase; box-shadow: 0 2px 8px rgba(255, 30, 39, 0.5);">
                      [07] INQUIRY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Transmission Coordinates Grid -->
          <tr>
            <td style="padding: 20px 24px; background-color: #0E111C; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left: 3px solid #FF1E27; padding-left: 14px;">
                <tr>
                  <td style="padding: 5px 0; font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace; color: #94A3B8; text-transform: uppercase; width: 110px;">
                    SENDER NAME:
                  </td>
                  <td style="padding: 5px 0; font-size: 15px; color: #FFFFFF; font-weight: 800;">
                    ${cleanName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace; color: #94A3B8; text-transform: uppercase;">
                    REPLY EMAIL:
                  </td>
                  <td style="padding: 5px 0; font-size: 15px;">
                    <a href="mailto:${cleanEmail}" style="color: #FF4D55; font-weight: 700; text-decoration: none; border-bottom: 1px dotted #FF4D55;">${cleanEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace; color: #94A3B8; text-transform: uppercase;">
                    SUBJECT:
                  </td>
                  <td style="padding: 5px 0; font-size: 14px; color: #F1F5F9; font-weight: 600;">
                    ${cleanSubject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace; color: #94A3B8; text-transform: uppercase;">
                    TIMESTAMP:
                  </td>
                  <td style="padding: 5px 0; font-size: 11px; font-family: 'SFMono-Regular', Consolas, monospace; color: #64748B;">
                    ${timestamp}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Payload Inner Card -->
          <tr>
            <td style="padding: 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #05060C; border: 1.5px solid rgba(255, 30, 39, 0.45); border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: rgba(255, 30, 39, 0.08); padding: 9px 18px; border-bottom: 1px solid rgba(255, 30, 39, 0.25);">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 11px; font-weight: 800; color: #FF4D55; letter-spacing: 0.12em; text-transform: uppercase;">
                            // TRANSMITTED PAYLOAD
                          </span>
                        </td>
                        <td align="right">
                          <span style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 10px; color: #64748B;">
                            ENCRYPTED TRANSMISSION
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 22px 18px; color: #F8FAFC; font-size: 15px; line-height: 1.7; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${sanitizedMessage}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Direct Reply Action CTA -->
          <tr>
            <td style="padding: 0 24px 26px 24px;" align="center">
              <a href="${replyUrl}" style="display: inline-block; background-color: #FF1E27; background-image: linear-gradient(135deg, #FF2E36 0%, #C80810 100%); color: #FFFFFF; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none; padding: 14px 32px; border-radius: 4px; box-shadow: 0 4px 18px rgba(255, 30, 39, 0.5); font-family: 'SFMono-Regular', Consolas, sans-serif;">
                [ REPLY TO ${cleanName.toUpperCase()} ↗ ]
              </a>
            </td>
          </tr>

          <!-- Cyber Baseline Signature Footer -->
          <tr>
            <td style="background-color: #070910; padding: 20px 24px; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0; font-size: 12px; font-weight: 800; color: #FFFFFF; font-family: 'SFMono-Regular', Consolas, monospace; letter-spacing: 0.08em; text-transform: uppercase;">
                CHARAN SAI BARNIKANI // PORTFOLIO v2.6
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                SRKR Engineering College • B.Tech in Artificial Intelligence &amp; Machine Learning<br>
                Rajahmundry, India • <a href="mailto:charan06082004@gmail.com" style="color: #FF4D55; text-decoration: none; font-weight: 600;">charan06082004@gmail.com</a>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 10px; color: #475569; font-family: 'SFMono-Regular', Consolas, monospace;">
                © ${year} CHARAN SAI BARNIKANI. ALL SPECIFICATIONS RESERVED.
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

app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on port ${PORT}`);
});
