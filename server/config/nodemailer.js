const nodemailer = require('nodemailer');

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@localxperiences.com';
const APP_NAME   = 'LocalXperiences';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create reusable transporter using SMTP credentials from .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (msg) => {
  await transporter.sendMail({
    from: FROM_EMAIL,
    ...msg,
  });
};

module.exports = { sendMail, FROM_EMAIL, APP_NAME, CLIENT_URL };
