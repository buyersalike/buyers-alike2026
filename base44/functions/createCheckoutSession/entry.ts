import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const PRICE_MAP = {
  professional: "price_1TDVHoEGLwZMIElTLEKllChI",
  enterprise: "price_1TDVHoEGLwZMIElTm2u5bpXM",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, successUrl, cancelUrl } = await req.json();

    if (!plan || !PRICE_MAP[plan]) {
      return Response.json({ error: 'Invalid plan. Use "professional" or "enterprise".' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: PRICE_MAP[plan],
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get("origin") || "https://app.base44.com"}/Partnerships?checkout=success`,
      cancel_url: cancelUrl || `${req.headers.get("origin") || "https://app.base44.com"}/#pricing`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        plan: plan,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});