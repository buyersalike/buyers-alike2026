import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch recent Stripe data in parallel
    const [charges, subscriptions, balanceTransactions, invoices] = await Promise.all([
      stripe.charges.list({ limit: 100 }).catch(e => { console.error("charges error:", e.message); return { data: [] }; }),
      stripe.subscriptions.list({ limit: 100, status: 'all' }).catch(e => { console.error("subs error:", e.message); return { data: [] }; }),
      stripe.balanceTransactions.list({ limit: 100 }).catch(e => { console.error("balance error:", e.message); return { data: [] }; }),
      stripe.invoices.list({ limit: 100 }).catch(e => { console.error("invoices error:", e.message); return { data: [] }; }),
    ]);

    // Process charges into monthly revenue
    const monthlyRevenue = {};
    for (const charge of charges.data) {
      if (charge.status === 'succeeded') {
        const date = new Date(charge.created * 1000);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + charge.amount / 100;
      }
    }

    // Subscription stats
    const subStats = {
      active: subscriptions.data.filter(s => s.status === 'active').length,
      trialing: subscriptions.data.filter(s => s.status === 'trialing').length,
      canceled: subscriptions.data.filter(s => s.status === 'canceled').length,
      past_due: subscriptions.data.filter(s => s.status === 'past_due').length,
      total: subscriptions.data.length,
    };

    // Recent transactions
    const recentTransactions = charges.data.slice(0, 20).map(c => ({
      id: c.id,
      amount: c.amount / 100,
      currency: c.currency,
      status: c.status,
      email: c.billing_details?.email || c.metadata?.user_email || 'N/A',
      description: c.description || c.metadata?.plan || 'Payment',
      created: c.created,
    }));

    // Invoice stats
    const invoiceStats = {
      paid: invoices.data.filter(i => i.status === 'paid').length,
      open: invoices.data.filter(i => i.status === 'open').length,
      uncollectible: invoices.data.filter(i => i.status === 'uncollectible').length,
      total: invoices.data.length,
      totalPaidAmount: invoices.data.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount_paid || 0), 0) / 100,
    };

    // Total revenue
    const totalRevenue = charges.data
      .filter(c => c.status === 'succeeded')
      .reduce((sum, c) => sum + c.amount / 100, 0);

    // MRR (Monthly Recurring Revenue) from active subscriptions
    const mrr = subscriptions.data
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const item = s.items?.data?.[0];
        if (!item) return sum;
        const amount = item.price?.unit_amount || 0;
        const interval = item.price?.recurring?.interval;
        if (interval === 'month') return sum + amount / 100;
        if (interval === 'year') return sum + amount / 100 / 12;
        return sum;
      }, 0);

    // Subscription details for management
    const subscriptionDetails = subscriptions.data.map(s => ({
      id: s.id,
      status: s.status,
      email: s.metadata?.user_email || s.customer_email || 'N/A',
      plan: s.metadata?.plan || s.items?.data?.[0]?.price?.nickname || 'Unknown',
      amount: (s.items?.data?.[0]?.price?.unit_amount || 0) / 100,
      currency: s.currency,
      interval: s.items?.data?.[0]?.price?.recurring?.interval || 'month',
      current_period_start: s.current_period_start,
      current_period_end: s.current_period_end,
      created: s.created,
      cancel_at_period_end: s.cancel_at_period_end,
    }));

    return Response.json({
      totalRevenue,
      mrr,
      monthlyRevenue,
      subscriptionStats: subStats,
      invoiceStats,
      recentTransactions,
      subscriptionDetails,
    });
  } catch (error) {
    console.error("Finance analytics error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});