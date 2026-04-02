const { sendMail, FROM_EMAIL, APP_NAME, CLIENT_URL } = require('../config/nodemailer');

const formatBookingSlot = (booking) => {
  const rawDate = booking?.slot?.date;
  const date = rawDate ? new Date(rawDate) : null;
  const dateLabel = date && Number.isFinite(date.getTime()) ? date.toDateString() : 'Date to be confirmed';
  const timeLabel = booking?.slot?.startTime ? ` at ${booking.slot.startTime}` : '';
  return `${dateLabel}${timeLabel}`;
};

const formatCurrency = (amountInCents = 0) => `$${(Number(amountInCents || 0) / 100).toFixed(2)}`;

// ─── Group Booking Invite Email ─────────────────────────────────────────────
const sendGroupInviteEmail = async ({ email, inviterName, experience, booking, groupCode, inviteNote }) => {
  const slotDate = booking?.slot?.date ? encodeURIComponent(new Date(booking.slot.date).toISOString()) : '';
  const startTime = booking?.slot?.startTime ? encodeURIComponent(booking.slot.startTime) : '';
  const slotId = booking?.slot?.slotId || booking?.slot?._id || '';
  const joinUrl = `${CLIENT_URL}/checkout/${experience._id}?slot=${slotId}&slotDate=${slotDate}&startTime=${startTime}&group=1&groupCode=${groupCode}`;
  const share = Array.isArray(booking?.splitPayments)
    ? booking.splitPayments.find((entry) => String(entry?.email || '').trim().toLowerCase() === String(email || '').trim().toLowerCase())
    : null;
  const amountLabel = formatCurrency(share?.amount || 0);
  const deadlineLabel = booking?.paymentDeadlineAt
    ? new Date(booking.paymentDeadlineAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;
  const msg = {
    to:      email,
    from:    FROM_EMAIL,
    subject: `${inviterName} invited you to join a group booking for ${experience.title}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fffb; border: 1px solid #d1fae5; border-radius: 20px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #166534, #16a34a); padding: 28px 32px; color: white;">
          <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.85;">Group Invite</p>
          <h2 style="margin: 0; font-size: 28px; line-height: 1.2;">You're invited to join this booking</h2>
          <p style="margin: 12px 0 0; font-size: 15px; line-height: 1.6; color: #dcfce7;">
            <strong>${inviterName}</strong> invited you to join <strong>${experience.title}</strong> with the group <strong>${booking.collaboration?.groupName || 'Your group'}</strong>.
          </p>
        </div>
        <div style="padding: 28px 32px;">
          <div style="background: white; border: 1px solid #dcfce7; border-radius: 16px; padding: 18px 20px; margin-bottom: 18px;">
            <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.08em;">Booking details</p>
            <p style="margin: 0 0 10px; color: #14532d;"><strong>Experience:</strong> ${experience.title}</p>
            <p style="margin: 0 0 10px; color: #14532d;"><strong>Date:</strong> ${formatBookingSlot(booking)}</p>
            <p style="margin: 0 0 10px; color: #14532d;"><strong>Group code:</strong> <span style="font-family: Consolas, monospace; background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; padding: 3px 8px;">${groupCode}</span></p>
            <p style="margin: 0 0 10px; color: #14532d;"><strong>Your share:</strong> ${amountLabel}</p>
            ${deadlineLabel ? `<p style="margin: 0; color: #14532d;"><strong>Payment deadline:</strong> ${deadlineLabel}</p>` : ''}
          </div>
          ${inviteNote ? `<blockquote style="margin: 0 0 18px; background: #ecfdf5; color: #166534; padding: 14px 16px; border-left: 4px solid #22c55e; border-radius: 12px;">${inviteNote}</blockquote>` : ''}
          <p style="margin: 0 0 16px; color: #365314; line-height: 1.7;">
            Open the checkout link below to review the booking and pay only your assigned share. Once your payment is complete, your spot in the group will be confirmed.
          </p>
          <a href="${joinUrl}" style="background:#16a34a; color:white; padding:14px 24px; text-decoration:none; border-radius:999px; display:inline-block; font-weight:700;">Review booking and pay your share</a>
          <p style="margin: 18px 0 0; color:#4b5563; font-size:12px; line-height:1.6;">If you do not want to join this booking, you can safely ignore this email.</p>
          <p style="margin: 8px 0 0; color:#4b5563; font-size:12px; line-height:1.6;">Need the code later? Use <strong>${groupCode}</strong> on the checkout page.</p>
        </div>
      </div>
    `,
  };
  await sendMail(msg);
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
