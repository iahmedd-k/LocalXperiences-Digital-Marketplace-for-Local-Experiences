const Stripe = require('stripe');

const stripeKey = process.env.STRIPE_SECRET_KEY;

let stripe;

if (!stripeKey) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set; Stripe payments are disabled.');
  stripe = {
    paymentIntents: {
      create: async () => { throw new Error('Stripe not configured'); },
      retrieve: async () => { throw new Error('Stripe not configured'); },
    },
    refunds: {
      create: async () => { throw new Error('Stripe not configured'); },
    },
  };
} else {
  stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' });
}

module.exports = stripe;
