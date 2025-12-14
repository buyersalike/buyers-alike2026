import React from "react";
import { Users, DollarSign, Handshake, UsersRound, CreditCard } from "lucide-react";
import MetricCard from "./MetricCard";

export default function GeneralSummary({ metrics }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #3B82F6 0%, #10B981 100%)' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
          General Summary
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          icon={Users}
          title="Total Users"
          value={metrics.totalUsers}
          subtitle="All registered users."
          color="#3B82F6"
          index={0}
        />
        <MetricCard
          icon={CreditCard}
          title="Active Paying Members"
          value={metrics.activePayingMembers}
          subtitle="Users with active subscriptions."
          color="#7C3AED"
          index={1}
        />
        <MetricCard
          icon={DollarSign}
          title="Est. Monthly Revenue"
          value={`$${metrics.monthlyRevenue}`}
          subtitle="Based on subscriptions."
          color="#10B981"
          index={2}
        />
        <MetricCard
          icon={Handshake}
          title="Total Partnerships"
          value={metrics.totalPartnerships}
          subtitle="All partnerships."
          color="#F59E0B"
          index={3}
        />
        <MetricCard
          icon={UsersRound}
          title="Total Groups"
          value={metrics.totalGroups}
          subtitle="Unique partnership groups."
          color="#EC4899"
          index={4}
        />
      </div>
    </div>
  );
}