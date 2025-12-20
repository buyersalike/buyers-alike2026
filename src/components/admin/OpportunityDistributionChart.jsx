import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

export default function OpportunityDistributionChart({ opportunities }) {
  // Group by category
  const categoryData = opportunities.reduce((acc, opp) => {
    const category = opp.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += 1;
    return acc;
  }, {});

  const data = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3B82F6', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 rounded-2xl"
      style={{ background: '#fff', border: '2px solid #000' }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: '#000' }}>
        Opportunities by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '8px',
              color: '#000'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}