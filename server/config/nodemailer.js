const nodemailer = require('nodemailer');

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@localxperiences.com';
const APP_NAME   = 'LocalXperiences';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SMTP_HOST = process.env.EMAIL_HOST || process.env.SMTP_HOST;
const SMTP_PORT = process.env.EMAIL_PORT || process.env.SMTP_PORT;
const SMTP_USER = process.env.EMAIL_USER || process.env.SMTP_USER;
const SMTP_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS;
const SMTP_SECURE = process.env.EMAIL_SECURE || process.env.SMTP_SECURE;

const hasSmtpConfig = Boolean(
  SMTP_HOST &&
  SMTP_PORT &&
  SMTP_USER &&
  SMTP_PASS
);

// Fall back to JSON transport in local/dev when SMTP is not configured.
const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || Number(SMTP_PORT) === 465).toLowerCase() === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    });

const sendMail = async (msg) => {
  const info = await transporter.sendMail({
    from: FROM_EMAIL,
    ...msg,
  });
  if (!hasSmtpConfig) {
    console.warn('EMAIL_* SMTP config missing. Email captured locally instead of being sent.');
    console.log('Email preview payload:', typeof info?.message === 'string' ? info.message : info);
  }
};

module.exports = { sendMail, FROM_EMAIL, APP_NAME, CLIENT_URL };
