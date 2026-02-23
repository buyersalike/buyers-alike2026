import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Users, GitCompareArrows } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useCompare } from "./CompareContext";

export default function OpportunityCard({ opportunity, index }) {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(opportunity.id);
  const typeColors = {
    "Real Estate": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Franchise": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Business": "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const handleCardClick = () => {
    navigate(createPageUrl('OpportunityDetail'), { state: { opportunity } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleCardClick}
      className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer touch-target"
      style={{
        background: '#fff',
        border: '1px solid #000',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={opportunity.image}
          alt={opportunity.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#D8A11F', color: '#fff' }}>
          {opportunity.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 line-clamp-2" style={{ color: '#000' }}>
          {opportunity.title}
        </h3>

        {/* Investment */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#22C55E' }} />
          <span className="text-xs sm:text-sm font-semibold" style={{ color: '#22C55E' }}>
            {opportunity.investment}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2" style={{ color: '#666' }}>
          {opportunity.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 gap-2" style={{ borderTop: '1px solid #000' }}>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5" style={{ color: '#666' }}>
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">Posted {opportunity.postedDate}</span>
              <span className="sm:hidden">{opportunity.postedDate}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: '#666' }}>
              <Users className="w-3 h-3" />
              <span>{opportunity.partners}</span>
            </div>
          </div>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium touch-target" 
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}