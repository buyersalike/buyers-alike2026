import React from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

const cards = [
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, color: "#22C55E", format: "currency" },
  { key: "mrr", label: "Monthly Recurring Revenue", icon: TrendingUp, color: "#3B82F6", format: "currency" },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: Users, color: "#7C3AED", format: "number" },
  { key: "paidInvoices", label: "Paid Invoices", icon: CreditCard, color: "#D8A11F", format: "number" },
];

export default function FinanceMetricCards({ data, users }) {
  const planCounts = {
    free: users.filter(u => !u.subscription_plan || u.subscription_plan === 'free').length,
    professional: users.filter(u => u.subscription_plan === 'professional').length,
    enterprise: users.filter(u => u.subscription_plan === 'enterprise').length,
  };

  const values = {
    totalRevenue: data?.totalRevenue || 0,
    mrr: data?.mrr || 0,
    activeSubscriptions: data?.subscriptionStats?.active || 0,
    paidInvoices: data?.invoiceStats?.paid || 0,
  };

  const formatValue = (val, format) => {
    if (format === "currency") return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return val.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl"
            style={{ background: '#fff', border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#000' }}>{formatValue(values[card.key], card.format)}</p>
            <p className="text-sm mt-1" style={{ color: '#666' }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Subscription Plan Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #E5E7EB' }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: '#000' }}>User Subscription Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Free", count: planCounts.free, color: "#6B7280" },
            { label: "Professional", count: planCounts.professional, color: "#3B82F6" },
            { label: "Enterprise", count: planCounts.enterprise, color: "#7C3AED" },
          ].map((plan) => (
            <div key={plan.label} className="text-center p-4 rounded-xl" style={{ background: `${plan.color}08`, border: `1px solid ${plan.color}22` }}>
              <p className="text-3xl font-bold" style={{ color: plan.color }}>{plan.count}</p>
              <p className="text-sm font-medium mt-1" style={{ color: '#666' }}>{plan.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                {users.length > 0 ? Math.round((plan.count / users.length) * 100) : 0}% of users
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}