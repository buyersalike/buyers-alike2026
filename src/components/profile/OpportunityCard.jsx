import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, Clock } from "lucide-react";

export default function OpportunityCard({ opportunity, index }) {
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInvestmentRange = () => {
    if (opportunity.investment_min && opportunity.investment_max) {
      return `${formatCurrency(opportunity.investment_min)} - ${formatCurrency(opportunity.investment_max)}`;
    }
    if (opportunity.investment_min) {
      return `From ${formatCurrency(opportunity.investment_min)}`;
    }
    if (opportunity.investment_max) {
      return `Up to ${formatCurrency(opportunity.investment_max)}`;
    }
    return null;
  };

  const investmentRange = getInvestmentRange();

  const getStatusConfig = () => {
    switch (opportunity.status) {
      case 'verified':
        return { icon: CheckCircle, text: 'Verified', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.2)' };
      case 'pending':
        return { icon: Clock, text: 'Pending', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' };
      default:
        return { icon: Clock, text: 'Unverified', color: '#7A8BA6', bg: 'rgba(122, 139, 166, 0.2)' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-6 rounded-2xl hover:shadow-xl transition-all cursor-pointer"
    >
      {/* Image */}
      {opportunity.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden" style={{ height: '150px', background: 'rgba(255, 255, 255, 0.05)' }}>
          <img 
            src={opportunity.image_url} 
            alt={opportunity.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold mb-3" style={{ color: '#3B82F6' }}>
        {opportunity.title}
      </h3>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className="bg-gray-800/50 text-white">
          {opportunity.category}
        </Badge>
        {investmentRange && (
          <Badge className="bg-teal-500/20 text-teal-300">
            Investment: {investmentRange}
          </Badge>
        )}
      </div>

      {/* Description */}
      <p className="text-sm mb-4 line-clamp-3" style={{ color: '#B6C4E0' }}>
        {opportunity.description}
      </p>

      {/* Source URL */}
      {opportunity.source_url && (
        <a 
          href={opportunity.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 mb-3 hover:underline"
          style={{ color: '#7A8BA6' }}
        >
          <span>Source: {new URL(opportunity.source_url).hostname}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: statusConfig.bg }}>
          <statusConfig.icon className="w-4 h-4" style={{ color: statusConfig.color }} />
          <span className="text-xs font-semibold" style={{ color: statusConfig.color }}>
            Status: {statusConfig.text}
          </span>
        </div>
      </div>
    </motion.div>
  );
}