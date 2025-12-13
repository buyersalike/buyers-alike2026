import React from "react";
import { Button } from "@/components/ui/button";
import { Store, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function BecomeVendorBanner({ onApplyClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 mb-8"
      style={{ background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(194, 65, 12, 0.1) 100%)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EA580C' }}>
            <Store className="w-7 h-7" style={{ color: '#fff' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
              Become a Vendor
            </h3>
            <p className="text-sm mb-2" style={{ color: '#FB923C' }}>
              Offer your services to our community
            </p>
            <p className="text-sm" style={{ color: '#B6C4E0' }}>
              Join our network of trusted service providers. Share your expertise in accounting, legal services, marketing, real estate, and more.
            </p>
          </div>
        </div>
        <Button 
          onClick={onApplyClick}
          className="rounded-xl px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap" 
          style={{ background: '#EA580C', color: '#fff' }}
        >
          Apply Now
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}