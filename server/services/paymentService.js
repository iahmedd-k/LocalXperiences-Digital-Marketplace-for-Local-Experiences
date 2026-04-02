const stripe = require('../config/stripe');

// ─── Create Payment Intent ─────────────────────────────────────────────────
const createPaymentIntent = async ({ amount, currency = 'usd', metadata = {} }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,   // in cents
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return paymentIntent;
};

// ─── Confirm Payment Intent ────────────────────────────────────────────────
const retrievePaymentIntent = async (paymentIntentId) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

// ─── Refund Payment ────────────────────────────────────────────────────────
const refundPayment = async (paymentIntentId, amount = null) => {
  const refundData = { payment_intent: paymentIntentId };
  if (amount) refundData.amount = amount; // Partial refund if amount provided

  const refund = await stripe.refunds.create(refundData);
  return refund;
};

module.exports = { createPaymentIntent, retrievePaymentIntent, refundPayment };