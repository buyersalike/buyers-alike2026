import React from "react";
import { Sparkles, CheckCircle, Clock, XCircle } from "lucide-react";
import MetricCard from "./MetricCard";

export default function InterestsSummary({ metrics }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #10B981 0%, #06B6D4 100%)' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
          Interests Summary
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Sparkles}
          title="Total"
          value={metrics.total}
          subtitle="All submitted interests."
          color="#3B82F6"
          index={0}
        />
        <MetricCard
          icon={CheckCircle}
          title="Approved"
          value={metrics.approved}
          subtitle="Approved interests."
          color="#10B981"
          index={1}
        />
        <MetricCard
          icon={Clock}
          title="Pending"
          value={metrics.pending}
          subtitle="Awaiting review."
          color="#F59E0B"
          index={2}
        />
        <MetricCard
          icon={XCircle}
          title="Rejected"
          value={metrics.rejected}
          subtitle="Rejected interests."
          color="#EF4444"
          index={3}
        />
      </div>
    </div>
  );
}