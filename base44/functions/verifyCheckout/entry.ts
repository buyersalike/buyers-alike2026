import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a paid plan
    if (user.subscription_plan === 'professional' || user.subscription_plan === 'enterprise') {
      return Response.json({ plan: user.subscription_plan, already_updated: true });
    }

    // Search for completed checkout sessions for this user
    const sessions = await stripe.checkout.sessions.list({
      status: 'complete',
      limit: 20,
    });

    // Filter sessions for this user
    const userSessions = sessions.data.filter(
      s => s.customer_email === user.email || s.metadata?.user_email === user.email
    );
    console.log("Found", userSessions.length, "completed sessions for", user.email);

    for (const session of userSessions) {
      const plan = session.metadata?.plan;
      if (plan && (plan === 'professional' || plan === 'enterprise')) {
        // Verify subscription is active
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            // Update user plan
            await base44.asServiceRole.entities.User.update(user.id, {
              subscription_plan: plan,
            });
            console.log("Updated user", user.email, "to plan:", plan);
            return Response.json({ plan, updated: true });
          }
        }
      }
    }

    return Response.json({ plan: user.subscription_plan || 'free', updated: false });
  } catch (error) {
    console.error("Verify checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});