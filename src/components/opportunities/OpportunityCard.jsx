import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, Users, GitCompareArrows, Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useCompare } from "./CompareContext";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

export default function OpportunityCard({ opportunity, index, currentUser, savedOpportunities }) {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(opportunity.id);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  // Determine opportunity type for saving
  const oppType = opportunity.source === "franchise"
    ? "Franchise"
    : (opportunity.source === "api" || opportunity.type === "Real Estate" || opportunity.category === "Real Estate")
      ? "Real Estate"
      : null;

  // Check if already saved
  const savedRecord = savedOpportunities?.find(
    s => s.opportunity_id === String(opportunity.id) && s.opportunity_type === oppType
  );
  const isSaved = !!savedRecord;

  const handleCardClick = () => {
    navigate(createPageUrl("OpportunityDetail"), { state: { opportunity } });
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!currentUser || saving) return;
    setSaving(true);
    if (isSaved) {
      await base44.entities.SavedOpportunity.delete(savedRecord.id);
    } else {
      await base44.entities.SavedOpportunity.create({
        user_email: currentUser.email,
        opportunity_type: oppType,
        opportunity_id: String(opportunity.id),
        title: opportunity.title,
        investment: opportunity.investment,
        description: opportunity.description,
        image: opportunity.image,
        location: opportunity.location || opportunity.address,
        source: opportunity.source,
        original_data: opportunity,
      });
    }
    queryClient.invalidateQueries(["savedOpportunities", currentUser.email]);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleCardClick}
      className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer touch-target"
      style={{
        background: "#fff",
        border: "1px solid #000",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)"
      }}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={opportunity.image}
          alt={opportunity.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#D8A11F", color: "#fff" }}>
          {opportunity.type}
        </div>
        {/* Save button on image */}
        {oppType && currentUser && (
          <button
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? `Remove from Saved ${oppType}` : `Save ${oppType}`}
            className="absolute top-4 right-4 p-2 rounded-full transition-all"
            style={{
              background: isSaved ? "#D8A11F" : "rgba(255,255,255,0.9)",
              color: isSaved ? "#fff" : "#D8A11F",
              border: "1px solid #D8A11F"
            }}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 line-clamp-2" style={{ color: "#000" }}>
          {opportunity.title}
        </h3>

        {/* Investment */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#22C55E" }} />
          <span className="text-xs sm:text-sm font-semibold" style={{ color: "#22C55E" }}>
            {opportunity.investment}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2" style={{ color: "#666" }}>
          {opportunity.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 gap-2" style={{ borderTop: "1px solid #000" }}>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5" style={{ color: "#666" }}>
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">Posted {opportunity.postedDate}</span>
              <span className="sm:hidden">{opportunity.postedDate}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "#666" }}>
              <Users className="w-3 h-3" />
              <span>{opportunity.partners}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                inCompare ? removeFromCompare(opportunity.id) : addToCompare(opportunity);
              }}
              title={inCompare ? "Remove from compare" : "Add to compare"}
              className="rounded-lg p-2 border transition-all touch-target"
              style={{
                background: inCompare ? "#D8A11F" : "#fff",
                border: inCompare ? "1px solid #D8A11F" : "1px solid #000",
                color: inCompare ? "#fff" : "#666"
              }}
            >
              <GitCompareArrows className="w-4 h-4" />
            </button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium touch-target"
              style={{ background: "#D8A11F", color: "#fff" }}
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}