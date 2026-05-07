import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const statusConfig = {
  succeeded: { icon: CheckCircle2, color: '#22C55E', label: 'Succeeded' },
  failed: { icon: XCircle, color: '#EF4444', label: 'Failed' },
  pending: { icon: Clock, color: '#F59E0B', label: 'Pending' },
};

export default function RecentTransactions({ transactions = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid #E5E7EB' }}
    >
      <div className="p-6 pb-3">
        <h3 className="text-lg font-bold" style={{ color: '#000' }}>Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: '#F9FAFB' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#666' }}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center" style={{ color: '#999' }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx, i) => {
                const cfg = statusConfig[tx.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-3 text-sm" style={{ color: '#000' }}>
                      {new Date(tx.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-sm" style={{ color: '#000' }}>{tx.email}</td>
                    <td className="px-6 py-3 text-sm capitalize" style={{ color: '#666' }}>{tx.description}</td>
                    <td className="px-6 py-3 text-sm font-semibold" style={{ color: '#000' }}>
                      ${tx.amount.toFixed(2)} {tx.currency?.toUpperCase()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
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