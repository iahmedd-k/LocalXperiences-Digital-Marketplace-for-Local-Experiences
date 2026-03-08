const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY not set; emails will be logged to console.');
  sgMail.send = async (msg) => {
    console.log('📧 [Mock send] to:', msg.to, 'subject:', msg.subject);
    return Promise.resolve();
  };
}

module.exports = sgMail;
