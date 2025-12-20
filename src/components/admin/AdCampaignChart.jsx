import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

export default function AdCampaignChart({ campaigns, metrics }) {
  // Group campaigns by month and calculate metrics
  const monthlyData = React.useMemo(() => {
    const data = {};
    
    campaigns.forEach(campaign => {
      const month = new Date(campaign.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!data[month]) {
        data[month] = { month, campaigns: 0, impressions: 0, clicks: 0 };
      }
      data[month].campaigns += 1;
    });

    // Add metrics data
    metrics.forEach(metric => {
      const month = new Date(metric.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (data[month]) {
        data[month].impressions += metric.impressions || 0;
        data[month].clicks += metric.clicks || 0;
      }
    });

    return Object.values(data).slice(-6); // Last 6 months
  }, [campaigns, metrics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 rounded-2xl"
      style={{ background: '#fff', border: '2px solid #000' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%)' }}>
          <TrendingUp className="w-5 h-5" style={{ color: '#fff' }} />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: '#000' }}>
            Campaign Performance
          </h3>
          <p className="text-sm" style={{ color: '#666' }}>
            Monthly campaigns and engagement
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="month" stroke="#000" tick={{ fill: '#000' }} />
          <YAxis stroke="#000" tick={{ fill: '#000' }} />
          <Tooltip 
            contentStyle={{ 
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '8px',
              color: '#000'
            }}
          />
          <Legend />
          <Bar dataKey="campaigns" fill="#7C3AED" name="Campaigns" />
          <Bar dataKey="impressions" fill="#3B82F6" name="Impressions" />
          <Bar dataKey="clicks" fill="#22C55E" name="Clicks" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}