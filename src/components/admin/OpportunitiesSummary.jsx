import React from "react";
import { Briefcase, Clock, CheckCircle, XCircle, FileX, Archive } from "lucide-react";
import MetricCard from "./MetricCard";

export default function OpportunitiesSummary({ metrics }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #F59E0B 0%, #EF4444 100%)' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
          Opportunities Summary
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <MetricCard
          icon={Briefcase}
          title="Total"
          value={metrics.total}
          subtitle="All submitted opportunities."
          color="#3B82F6"
          index={0}
        />
        <MetricCard
          icon={Clock}
          title="Pending"
          value={metrics.pending}
          subtitle="Awaiting review."
          color="#F59E0B"
          index={1}
        />
        <MetricCard
          icon={CheckCircle}
          title="Verified"
          value={metrics.verified}
          subtitle="Approved opportunities."
          color="#10B981"
          index={2}
        />
        <MetricCard
          icon={FileX}
          title="Unverified"
          value={metrics.unverified}
          subtitle="Unverified opportunities."
          color="#6B7280"
          index={3}
        />
        <MetricCard
          icon={XCircle}
          title="Rejected"
          value={metrics.rejected}
          subtitle="Rejected opportunities."
          color="#EF4444"
          index={4}
        />
        <MetricCard
          icon={Archive}
          title="Closed"
          value={metrics.closed}
          subtitle="Closed opportunities."
          color="#8B5CF6"
          index={5}
        />
      </div>
    </div>
  );
}