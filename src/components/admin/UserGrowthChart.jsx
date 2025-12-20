import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function UserGrowthChart({ users }) {
  // Group users by month
  const monthlyData = users.reduce((acc, user) => {
    const date = new Date(user.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, users: 0 };
    }
    acc[monthKey].users += 1;
    return acc;
  }, {});

  const data = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate cumulative growth
  let cumulative = 0;
  const cumulativeData = data.map(item => {
    cumulative += item.users;
    return { month: item.month, users: cumulative };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl"
      style={{ background: '#fff', border: '2px solid #000' }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: '#000' }}>
        User Growth Over Time
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={cumulativeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis 
            dataKey="month" 
            stroke="#000"
            tick={{ fill: '#000' }}
          />
          <YAxis 
            stroke="#000"
            tick={{ fill: '#000' }}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '8px',
              color: '#000'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="users" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}