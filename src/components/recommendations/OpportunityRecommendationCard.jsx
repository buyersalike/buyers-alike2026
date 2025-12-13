import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle } from "lucide-react";

export default function OpportunityRecommendationCard({ opportunity, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1"
      style={{
        background: '#0F2744',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={opportunity.image}
          alt={opportunity.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: '#E5EDFF' }}>
          {opportunity.title}
        </h3>

        {/* Category Badge */}
        <div className="inline-block px-3 py-1 rounded-md text-xs font-medium mb-3" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          {opportunity.category}
        </div>

        {/* Description */}
        <p className="text-sm mb-3 line-clamp-3" style={{ color: '#B6C4E0' }}>
          {opportunity.description}
        </p>

        {/* Created By */}
        <p className="text-xs mb-3" style={{ color: '#7A8BA6' }}>
          Created by: {opportunity.createdBy}
        </p>

        {/* Match Percentage */}
        <div className="flex items-center justify-center gap-1 mb-4 py-2 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
          <Heart className="w-4 h-4" style={{ color: '#22C55E', fill: '#22C55E' }} />
          <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>
            {opportunity.matchPercentage}% Match
          </span>
        </div>

        {/* Apply Button */}
        <Button 
          className="w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2" 
          style={{ background: '#22C55E', color: '#fff' }}
        >
          <CheckCircle className="w-4 h-4" />
          Apply Now
        </Button>
      </div>
    </motion.div>
  );
}