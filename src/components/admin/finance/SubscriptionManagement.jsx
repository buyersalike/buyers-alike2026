import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle } from "lucide-react";

const statusColors = {
  active: '#22C55E',
  trialing: '#3B82F6',
  canceled: '#EF4444',
  past_due: '#F59E0B',
  incomplete: '#6B7280',
};

export default function SubscriptionManagement({ subscriptions = [] }) {
  const [search, setSearch] = useState("");

  const filtered = subscriptions.filter(s =>
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.plan?.toLowerCase().includes(search.toLowerCase()) ||
    s.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid #E5E7EB' }}
    >
      <div className="p-6 pb-3 flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold" style={{ color: '#000' }}>Subscription Management</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#999' }} />
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', color: '#000' }}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: '#F9FAFB' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Plan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Period End</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Cancel?</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center" style={{ color: '#999' }}>
                  No subscriptions found
                </td>
              </tr>
            ) : (
              filtered.map((sub, i) => {
                const color = statusColors[sub.status] || '#6B7280';
                return (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-sm" style={{ color: '#000' }}>{sub.email}</td>
                    <td className="px-6 py-3 text-sm capitalize font-medium" style={{ color: '#000' }}>{sub.plan}</td>
                    <td className="px-6 py-3 text-sm font-semibold" style={{ color: '#000' }}>
                      ${sub.amount.toFixed(2)}/{sub.interval}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ background: `${color}15`, color }}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: '#666' }}>
                      {sub.current_period_end ? new Date(sub.current_period_end * 1000).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-3">
                      {sub.cancel_at_period_end ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#EF4444' }}>
                          <AlertCircle className="w-3 h-3" /> Canceling
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: '#999' }}>No</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}