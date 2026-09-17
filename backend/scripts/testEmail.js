require('dotenv').config();
const nodemailer = require('nodemailer');

const test = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  console.log('Testing SMTP with User:', user);
  console.log('Pass configured:', !!pass);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim()
    }
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified!');

    console.log('Sending email to arjunun1506@gmail.com...');
    const info = await transporter.sendMail({
      from: `"ProjectNexus Governance" <${user}>`,
      to: 'arjunun1506@gmail.com',
      subject: '[ProjectNexus Test] SMTP Verification',
      text: 'Hello Arjun! This is a test email from ProjectNexus to verify your SMTP delivery is working.'
    });

    console.log('✅ Email sent successfully!');
    console.log('Response:', info.response);
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
  } catch (err) {
    console.error('❌ Error sending mail:', err);
  }
};

test();
