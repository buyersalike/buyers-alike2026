import React from "react";
import { motion } from "framer-motion";
import { Store, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function VendorStatusSection({ vendorApp, isOwnProfile }) {
  if (!vendorApp) {
    return null;
  }

  const getStatusConfig = () => {
    switch (vendorApp.status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: '#22C55E',
          bg: 'rgba(34, 197, 94, 0.15)',
          border: 'rgba(34, 197, 94, 0.3)',
          text: 'Approved Vendor',
          badgeClass: 'bg-green-500/20 text-green-300'
        };
      case 'pending':
        return {
          icon: Clock,
          color: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.3)',
          text: 'Pending Approval',
          badgeClass: 'bg-yellow-500/20 text-yellow-300'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: 'Application Rejected',
          badgeClass: 'bg-red-500/20 text-red-300'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: config.bg }}>
          <Store className="w-6 h-6" style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold" style={{ color: '#E5EDFF' }}>
            Vendor Status
          </h3>
          <Badge className={config.badgeClass}>{config.text}</Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <span style={{ color: '#B6C4E0' }}>Business Name</span>
          <span className="font-semibold" style={{ color: '#E5EDFF' }}>{vendorApp.business_name}</span>
        </div>

        {vendorApp.vendor_id && (
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#B6C4E0' }}>Vendor ID</span>
            <span className="font-mono font-bold" style={{ color: config.color }}>{vendorApp.vendor_id}</span>
          </div>
        )}

        {vendorApp.category && (
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#B6C4E0' }}>Category</span>
            <span className="font-semibold" style={{ color: '#E5EDFF' }}>{vendorApp.category}</span>
          </div>
        )}

        {vendorApp.province && (
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#B6C4E0' }}>Province</span>
            <span className="font-semibold" style={{ color: '#E5EDFF' }}>{vendorApp.province}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}