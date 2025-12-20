import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

export default function ActivityChart({ activities }) {
  // Group by type
  const typeData = activities.reduce((acc, activity) => {
    const type = activity.type || 'other';
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += 1;
    return acc;
  }, {});

  const data = Object.entries(typeData)
    .map(([type, count]) => ({
      type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 activities

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 rounded-2xl"
      style={{ background: '#fff', border: '2px solid #000' }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: '#000' }}>
        Top Activities
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis 
            dataKey="type" 
            stroke="#000"
            tick={{ fill: '#000', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
            label={{ value: 'Activity Type', position: 'insideBottom', offset: -10, fill: '#000', fontSize: 14, fontWeight: 600 }}
          />
          <YAxis 
            stroke="#000"
            tick={{ fill: '#000' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#000', fontSize: 14, fontWeight: 600 }}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '8px',
              color: '#000'
            }}
          />
          <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}