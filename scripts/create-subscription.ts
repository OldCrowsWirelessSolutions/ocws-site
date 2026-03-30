import { createSubscription, generateSubscriptionId } from '../lib/subscriptions';
import { sendFledglingWelcomeEmail } from '../lib/subscription-email';
import redis from '../lib/redis';

async function run() {
  const email = 'bourniaslinda7@gmail.com';
  const name = 'Linda';
  const tier = 'fledgling';

  const code = `CORVUS-FLEDGLING-LINDA1`;

  await createSubscription({
    subscription_id: code,
    customer_email: email,
    customer_name: name,
    tier,
    status: 'active',
    stripe_subscription_id: null,
    stripe_customer_id: null,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    verdicts_used: 0,
    reckonings_used: { small: 0, standard: 0, commercial: 0 },
    extra_verdict_credits: 0,
  });

  await redis.set(`sub:${code}:fledgling_verdict_used`, 'false');

  await redis.set(`code:${code}`, JSON.stringify({
    subscriptionId: code,
    tier,
    email,
    createdAt: new Date().toISOString(),
    active: true,
    usageCount: 0,
    lastUsed: null,
  }));

  await redis.set(`email:${email.toLowerCase()}:code`, code);

  await sendFledglingWelcomeEmail(email, code);

  console.log('Created subscription:', code, 'for', email);
  console.log('Welcome email sent.');
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
