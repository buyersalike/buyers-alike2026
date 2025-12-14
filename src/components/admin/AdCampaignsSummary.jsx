import React from "react";
import MetricCard from "./MetricCard";
import { TrendingUp, Clock, CheckCircle, XCircle, DollarSign, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function AdCampaignsSummary({ metrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #F59E0B 100%)' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
          Ad Campaigns Summary
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          icon={TrendingUp}
          title="Total Campaigns"
          value={metrics.total}
          subtitle="All time"
          color="#7C3AED"
        />
        <MetricCard
          icon={CheckCircle}
          title="Active Campaigns"
          value={metrics.active}
          subtitle="Currently running"
          color="#22C55E"
        />
        <MetricCard
          icon={Clock}
          title="Pending Approval"
          value={metrics.pending}
          subtitle="Awaiting review"
          color="#F59E0B"
        />
        <MetricCard
          icon={XCircle}
          title="Rejected"
          value={metrics.rejected}
          subtitle="Not approved"
          color="#EF4444"
        />
        <MetricCard
          icon={Eye}
          title="Total Impressions"
          value={metrics.totalImpressions?.toLocaleString() || "0"}
          subtitle="All campaigns"
          color="#3B82F6"
        />
        <MetricCard
          icon={DollarSign}
          title="Est. Revenue"
          value={`$${metrics.totalRevenue?.toLocaleString() || "0"}`}
          subtitle="Monthly recurring"
          color="#10B981"
        />
      </div>
    </motion.div>
  );
}