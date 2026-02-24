import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bookmark, Trash2, DollarSign, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SavedListingsTab({ userEmail, isOwnProfile }) {
  const [activeType, setActiveType] = useState("Franchise");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: savedItems = [], isLoading } = useQuery({
    queryKey: ["savedOpportunities", userEmail],
    queryFn: () => base44.entities.SavedOpportunity.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const franchises = savedItems.filter(i => i.opportunity_type === "Franchise");
  const realEstates = savedItems.filter(i => i.opportunity_type === "Real Estate");
  const displayed = activeType === "Franchise" ? franchises : realEstates;

  const handleRemove = async (id) => {
    await base44.entities.SavedOpportunity.delete(id);
    queryClient.invalidateQueries(["savedOpportunities", userEmail]);
  };

  const handleView = (item) => {
    navigate(createPageUrl("OpportunityDetail"), { state: { opportunity: item.original_data } });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading saved listings...</div>;
  }

  return (
    <div>
      {/* Toggle Tabs */}
      <div className="flex gap-3 mb-6">
        {["Franchise", "Real Estate"].map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className="px-5 py-2 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: activeType === type ? "#D8A11F" : "#fff",
              color: activeType === type ? "#fff" : "#000",
              border: "1px solid #000"
            }}
          >
            {type}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{
              background: activeType === type ? "rgba(255,255,255,0.3)" : "#f3f4f6",
              color: activeType === type ? "#fff" : "#666"
            }}>
              {type === "Franchise" ? franchises.length : realEstates.length}
            </span>
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
          <Bookmark className="w-12 h-12 mx-auto mb-3" style={{ color: "#D8A11F" }} />
          <p className="text-lg font-semibold" style={{ color: "#000" }}>No saved {activeType} listings</p>
          <p className="text-sm mt-1" style={{ color: "#666" }}>
            {isOwnProfile ? `Browse opportunities and save ${activeType.toLowerCase()} listings that interest you.` : `This user hasn't saved any ${activeType.toLowerCase()} listings yet.`}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1px solid #000", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            >
              {item.image && (
                <div className="h-36 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ color: "#000" }}>
                  {item.title}
                </h3>
                {item.investment && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                    <span className="text-xs font-medium" style={{ color: "#22C55E" }}>{item.investment}</span>
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5" style={{ color: "#666" }} />
                    <span className="text-xs" style={{ color: "#666" }}>{item.location}</span>
                  </div>
                )}
                {item.description && (
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: "#666" }}>{item.description}</p>
                )}
                <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <Button
                    onClick={() => handleView(item)}
                    className="flex-1 text-xs py-1.5 rounded-lg"
                    style={{ background: "#D8A11F", color: "#fff" }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                  {isOwnProfile && (
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="px-3 py-1.5 rounded-lg border transition-colors hover:bg-red-50"
                      style={{ border: "1px solid #ef4444", color: "#ef4444" }}
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}