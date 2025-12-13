import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  Bookmark,
  Share2
} from "lucide-react";

export default function PartnershipCard({ partnership, index }) {
  const matchPercentage = partnership.matchScore || 85;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group glass-card glass-card-hover p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 transition-colors" style={{ color: '#E5EDFF' }}>
            {partnership.title}
          </h3>
          <p className="text-sm line-clamp-2" style={{ color: '#B6C4E0' }}>{partnership.description}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button className="w-8 h-8 rounded-lg glass-card glass-card-hover flex items-center justify-center" style={{ color: '#7A8BA6' }}>
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg glass-card glass-card-hover flex items-center justify-center" style={{ color: '#7A8BA6' }}>
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {Array(5).fill(0).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#FACC15' }} />
        ))}
        <span className="text-xs ml-1" style={{ color: '#7A8BA6' }}>(4.9)</span>
      </div>

      {/* Match Score */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: '#B6C4E0' }}>Match Score</span>
          <span className="text-sm font-semibold" style={{ color: '#E5EDFF' }}>{matchPercentage}%</span>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${matchPercentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full rounded-full"
            style={{
              background: matchPercentage >= 90 
                ? 'linear-gradient(90deg, #22C55E 0%, #22C55E 100%)' 
                : matchPercentage >= 75
                ? 'linear-gradient(90deg, #FACC15 0%, #EF4444 100%)'
                : 'linear-gradient(90deg, #FACC15 0%, #FACC15 100%)'
            }}
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: '#3B82F6' }} />
          <span className="text-sm" style={{ color: '#B6C4E0' }}>{partnership.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" style={{ color: '#7C3AED' }} />
          <span className="text-sm" style={{ color: '#B6C4E0' }}>{partnership.industry}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: '#22C55E' }} />
          <span className="text-sm" style={{ color: '#B6C4E0' }}>{partnership.dealSize}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: '#3B82F6' }} />
          <span className="text-sm" style={{ color: '#B6C4E0' }}>{partnership.companySize}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8BA6' }}>
          <Calendar className="w-3 h-3" />
          <span>Posted {partnership.postedDate}</span>
        </div>
        <Button className="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}>
          View Full Details
        </Button>
      </div>
    </motion.div>
  );
}