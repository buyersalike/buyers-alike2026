import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import FinanceMetricCards from "./FinanceMetricCards";
import RevenueChart from "./RevenueChart";
import SubscriptionStatusChart from "./SubscriptionStatusChart";
import RecentTransactions from "./RecentTransactions";
import SubscriptionManagement from "./SubscriptionManagement";

export default function FinanceTab({ users = [] }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financeAnalytics'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getFinanceAnalytics', {});
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: '#D8A11F' }} />
        <p style={{ color: '#666' }}>Loading finance data from Stripe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 rounded-2xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
        <p className="text-lg font-semibold" style={{ color: '#DC2626' }}>Failed to load finance data</p>
        <p className="text-sm mt-1" style={{ color: '#666' }}>{error.message || 'Please check your Stripe configuration.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #22C55E 0%, #3B82F6 100%)' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#000' }}>Finance & Payment Analytics</h2>
      </motion.div>

      {/* KPI Cards */}
      <FinanceMetricCards data={data} users={users} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart monthlyRevenue={data?.monthlyRevenue} />
        <SubscriptionStatusChart stats={data?.subscriptionStats} />
      </div>

      {/* Subscription Management */}
      <SubscriptionManagement subscriptions={data?.subscriptionDetails || []} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={data?.recentTransactions || []} />
    </div>
  );
}