import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function RevenueChart({ monthlyRevenue = {} }) {
  const chartData = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: amount,
    }));

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 rounded-2xl"
        style={{ background: '#fff', border: '1px solid #E5E7EB' }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: '#000' }}>Monthly Revenue</h3>
        <div className="h-64 flex items-center justify-center">
          <p style={{ color: '#999' }}>No revenue data available yet</p>
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
      <h3 className="text-lg font-bold mb-4" style={{ color: '#000' }}>Monthly Revenue</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12 }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#22C55E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}