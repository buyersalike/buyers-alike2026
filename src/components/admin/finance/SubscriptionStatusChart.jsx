import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  active: '#22C55E',
  trialing: '#3B82F6',
  canceled: '#EF4444',
  past_due: '#F59E0B',
};

export default function SubscriptionStatusChart({ stats = {} }) {
  const chartData = [
    { name: 'Active', value: stats.active || 0 },
    { name: 'Trialing', value: stats.trialing || 0 },
    { name: 'Canceled', value: stats.canceled || 0 },
    { name: 'Past Due', value: stats.past_due || 0 },
  ].filter(d => d.value > 0);

  const colors = [COLORS.active, COLORS.trialing, COLORS.canceled, COLORS.past_due];

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #E5E7EB' }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: '#000' }}>Subscription Status</h3>
        <div className="h-64 flex items-center justify-center">
          <p style={{ color: '#999' }}>No subscription data yet</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 rounded-2xl"
      style={{ background: '#fff', border: '1px solid #E5E7EB' }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: '#000' }}>Subscription Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12 }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}