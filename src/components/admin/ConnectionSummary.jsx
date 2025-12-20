import React from "react";
import { Link, UserPlus, UserCheck } from "lucide-react";
import MetricCard from "./MetricCard";

export default function ConnectionSummary({ metrics }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #EC4899 100%)' }} />
        <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
          Connection Summary
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={Link}
          title="Total"
          value={metrics.total}
          subtitle="All active user connections."
          color="#3B82F6"
          index={0}
        />
        <MetricCard
          icon={UserPlus}
          title="Pending Requests"
          value={metrics.pending}
          subtitle="Awaiting your response."
          color="#F59E0B"
          index={1}
        />
        <MetricCard
          icon={UserCheck}
          title="Requested Connections"
          value={metrics.requested}
          subtitle="Sent but not accepted yet."
          color="#7C3AED"
          index={2}
        />
      </div>
    </div>
  );
}