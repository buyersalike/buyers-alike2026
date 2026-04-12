import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Received Stripe event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email || session.customer_email;
      const plan = session.metadata?.plan;

      console.log("Checkout completed for:", userEmail, "Plan:", plan);

      if (userEmail && plan) {
        // Find user by email and update their subscription plan
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_plan: plan,
          });
          console.log("Updated user", userEmail, "to plan:", plan);
        } else {
          console.error("User not found for email:", userEmail);
        }
      } else {
        console.error("Missing user_email or plan in session metadata");
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerEmail = subscription.metadata?.user_email;

      if (customerEmail) {
        const users = await base44.asServiceRole.entities.User.filter({ email: customerEmail });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_plan: "free",
          });
          console.log("Downgraded user", customerEmail, "to free plan");
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});