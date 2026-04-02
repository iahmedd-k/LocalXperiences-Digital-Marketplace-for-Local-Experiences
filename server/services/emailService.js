// ─── Group Booking Invite Email ─────────────────────────────────────────────
const sendGroupInviteEmail = async ({ email, inviterName, experience, booking, groupCode, inviteNote }) => {
  const joinUrl = `${CLIENT_URL}/checkout/${experience._id}?slot=${booking.slot?.slotId || booking.slot?._id || ''}&group=1&groupCode=${groupCode}`;
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `${inviterName} invited you to join a group booking for ${experience.title}!` ,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">You're invited to join a group booking!</h2>
        <p><strong>${inviterName}</strong> invited you to join a group for <strong>${experience.title}</strong>.</p>
        <p><strong>Group name:</strong> ${booking.collaboration?.groupName || ''}</p>
        <p><strong>Group code:</strong> <span style="font-family:monospace;">${groupCode}</span></p>
        ${inviteNote ? `<blockquote style='background:#f9f9f9; padding:10px; border-left:4px solid #f97316; margin:16px 0;'>${inviteNote}</blockquote>` : ''}
        <a href="${joinUrl}" style="background:#f97316; color:white; padding:12px 24px; text-decoration:none; border-radius:5px; display:inline-block; margin:16px 0;">Join this group booking</a>
        <p style="color:#666; font-size:12px;">If you don't want to join, you can ignore this email.</p>
      </div>
    `,
  };
  await sgMail.send(msg);
};

const { sendMail, FROM_EMAIL, APP_NAME, CLIENT_URL } = require('../config/nodemailer');

const formatBookingSlot = (booking) => {
  const rawDate = booking?.slot?.date;
  const date = rawDate ? new Date(rawDate) : null;
  const dateLabel = date && Number.isFinite(date.getTime()) ? date.toDateString() : 'Date to be confirmed';
  const timeLabel = booking?.slot?.startTime ? ` at ${booking.slot.startTime}` : '';
  return `${dateLabel}${timeLabel}`;
};

// ─── Welcome Email ─────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ email, name, role }) => {
  const isHost = role === 'host';
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `Welcome to ${APP_NAME}! 🌍`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Welcome to ${APP_NAME}, ${name}!</h2>
        <p>We're excited to have you as a <strong>${isHost ? 'Experience Host' : 'Traveler'}</strong>.</p>
        ${isHost
          ? `<p>Start creating experiences from your <a href="${CLIENT_URL}/host/dashboard">Host Dashboard</a>.</p>`
          : `<p>Start exploring at <a href="${CLIENT_URL}">LocalXperiences</a>.</p>`
        }
        <p style="color:#666; font-size:12px;">If you didn't create this account, please ignore this email.</p>
      </div>
    `,
  };
  await sendMail(msg);
};

// ─── Booking Confirmation (Traveler) ───────────────────────────────────────
const sendBookingConfirmation = async ({ email, name, experience, booking }) => {
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `Booking Confirmed — ${experience.title} ✅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Your booking is confirmed!</h2>
        <p>Hi ${name}, you're all set for <strong>${experience.title}</strong>.</p>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr><td style="padding:8px; border:1px solid #eee;"><strong>Date</strong></td><td style="padding:8px; border:1px solid #eee;">${formatBookingSlot(booking)}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><strong>Guests</strong></td><td style="padding:8px; border:1px solid #eee;">${booking.guestCount}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><strong>Amount Paid</strong></td><td style="padding:8px; border:1px solid #eee;">$${(booking.amount / 100).toFixed(2)}</td></tr>
        </table>
        <a href="${CLIENT_URL}/my-bookings" style="background:#f97316; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Booking</a>
      </div>
    `,
  };
  await sendMail(msg);
};

// ─── New Booking Alert (Host) ──────────────────────────────────────────────
const sendNewBookingAlert = async ({ email, hostName, experience, booking, travelerName }) => {
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `New Booking — ${experience.title} 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">You have a new booking!</h2>
        <p>Hi ${hostName}, <strong>${travelerName}</strong> just booked <strong>${experience.title}</strong>.</p>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr><td style="padding:8px; border:1px solid #eee;"><strong>Date</strong></td><td style="padding:8px; border:1px solid #eee;">${formatBookingSlot(booking)}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><strong>Guests</strong></td><td style="padding:8px; border:1px solid #eee;">${booking.guestCount}</td></tr>
          <tr><td style="padding:8px; border:1px solid #eee;"><strong>Amount</strong></td><td style="padding:8px; border:1px solid #eee;">$${(booking.amount / 100).toFixed(2)}</td></tr>
        </table>
        <a href="${CLIENT_URL}/host/bookings" style="background:#f97316; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View in Dashboard</a>
      </div>
    `,
  };
  await sendMail(msg);
};

// ─── Booking Cancellation ──────────────────────────────────────────────────
const sendCancellationEmail = async ({ email, name, experience, cancelledBy }) => {
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `Booking Cancelled — ${experience.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Booking Cancelled</h2>
        <p>Hi ${name}, your booking for <strong>${experience.title}</strong> has been cancelled${cancelledBy === 'host' ? ' by the host' : ''}.</p>
        <p>If you paid, a refund will be processed within 5-7 business days.</p>
        <a href="${CLIENT_URL}" style="background:#f97316; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Explore More</a>
      </div>
    `,
  };
  await sendMail(msg);
};

// ─── Booking Completed (Traveler) ─────────────────────────────────────────
const sendBookingCompletedEmail = async ({ email, name, experience }) => {
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `Experience Completed — ${experience.title} 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Your experience is marked as completed</h2>
        <p>Hi ${name}, your booking for <strong>${experience.title}</strong> has been marked as completed by the host.</p>
        <p>Thank you for exploring with ${APP_NAME}. You can share feedback from your bookings page.</p>
        <a href="${CLIENT_URL}/my-bookings" style="background:#16a34a; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View My Bookings</a>
      </div>
    `,
  };
  await sendMail(msg);
};

// ─── New Review Alert (Host) ───────────────────────────────────────────────
const sendNewReviewAlert = async ({ email, hostName, experience, rating, reviewerName }) => {
  const stars = '⭐'.repeat(rating);
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `New Review on ${experience.title} ${stars}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">You received a new review!</h2>
        <p>Hi ${hostName}, <strong>${reviewerName}</strong> left a ${stars} review on <strong>${experience.title}</strong>.</p>
        <a href="${CLIENT_URL}/host/reviews" style="background:#f97316; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Review</a>
      </div>
    `,
  };
  await sendMail(msg);
};

// ─── New Question Alert (Host) ─────────────────────────────────────────────
const sendNewQuestionAlert = async ({ email, hostName, experience, question, askerName }) => {
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `New Question on ${experience.title} ❓`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Someone asked a question!</h2>
        <p>Hi ${hostName}, <strong>${askerName}</strong> asked on <strong>${experience.title}</strong>:</p>
        <blockquote style="background:#f9f9f9; padding:15px; border-left:4px solid #f97316; margin:20px 0;">"${question}"</blockquote>
        <a href="${CLIENT_URL}/host/dashboard" style="background:#f97316; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Answer Now</a>
      </div>
    `,
  };
  await sendMail(msg);
};

// ─── Question Answered Alert (Traveler) ───────────────────────────────────
const sendQuestionAnsweredAlert = async ({ email, name, experience, answer }) => {
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `Your question was answered — ${experience.title} ✅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Your question was answered!</h2>
        <p>Hi ${name}, the host replied on <strong>${experience.title}</strong>:</p>
        <blockquote style="background:#f9f9f9; padding:15px; border-left:4px solid #f97316; margin:20px 0;">"${answer}"</blockquote>
        <a href="${CLIENT_URL}/experiences" style="background:#f97316; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">View Experience</a>
      </div>
    `,
  };
  await sendMail(msg);
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendNewBookingAlert,
  sendCancellationEmail,
  sendBookingCompletedEmail,
  sendNewReviewAlert,
  sendNewQuestionAlert,
  sendQuestionAnsweredAlert,
  sendGroupInviteEmail,
};
