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
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #183B2B; max-width: 600px; margin: 0 auto; border: 2.5px solid #183B2B; border-radius: 16px; padding: 28px; background-color: #FFF5F5;">
              <h2 style="color: #6941C6; margin-top: 0; border-bottom: 2px solid #183B2B; padding-bottom: 12px;">New Portfolio Message 📬</h2>
              <p><strong>From:</strong> ${cleanName} (<a href="mailto:${cleanEmail}" style="color: #6941C6;">${cleanEmail}</a>)</p>
              <p><strong>Subject:</strong> ${cleanSubject}</p>
              <div style="margin-top: 18px; padding: 16px; background-color: #FFFFFF; border: 2px solid #183B2B; border-radius: 10px;">
                <h4 style="margin: 0 0 8px 0;">Message:</h4>
                <p style="white-space: pre-wrap; margin: 0;">${cleanMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <p style="margin-top: 20px; font-size: 13px; color: #536E60;">Reply directly to this email to reach ${cleanName}.</p>
            </div>
          `,
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

app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend running on port ${PORT}`);
});
