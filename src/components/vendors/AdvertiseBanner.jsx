import React from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AdvertiseBanner({ onApplyClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 mb-8"
      style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#6366F1' }}>
            <Megaphone className="w-7 h-7" style={{ color: '#fff' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
              Apply to Advertise
            </h3>
            <p className="text-sm mb-2" style={{ color: '#A5B4FC' }}>
              Promote your business to our community
            </p>
            <p className="text-sm" style={{ color: '#B6C4E0' }}>
              Already a vendor? Take your visibility to the next level with featured advertising placements and reach more potential clients.
            </p>
          </div>
        </div>
        <Button 
          onClick={onApplyClick}
          className="rounded-xl px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap" 
          style={{ background: '#6366F1', color: '#fff' }}
        >
          <Sparkles className="w-5 h-5" />
          Apply to Advertise
        </Button>
      </div>
    </motion.div>
  );
}