import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, Sparkles, Mail, Phone, Globe, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function OpportunityDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const opportunity = location.state?.opportunity;

  if (!opportunity) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8" style={{ background: '#F2F1F5' }}>
          <div className="max-w-4xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#000' }}>Opportunity Not Found</h1>
            <Button onClick={() => navigate(-1)} style={{ background: '#D8A11F', color: '#fff' }}>
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const typeColors = {
    "Real Estate": "#3B82F6",
    "Franchise": "#8B5CF6",
    "Business": "#10B981",
    "Partnership": "#F59E0B",
    "Investment": "#EF4444",
  };

  // Mock additional images for real estate
  const additionalImages = opportunity.type === "Real Estate" ? [
    opportunity.image,
    "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&h=600&fit=crop",
  ] : [opportunity.image];

  const [selectedImage, setSelectedImage] = useState(additionalImages[0]);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: '100vh', background: '#F2F1F5' }}>
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-6 rounded-xl"
            style={{ border: '1px solid #000', color: '#000' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div>
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden mb-4"
                style={{ border: '1px solid #000', height: '400px' }}
              >
                <img
                  src={selectedImage}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Thumbnail Gallery */}
              {additionalImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {additionalImages.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedImage(img)}
                      className="rounded-xl overflow-hidden cursor-pointer"
                      style={{
                        border: selectedImage === img ? '3px solid #D8A11F' : '1px solid #000',
                        height: '80px'
                      }}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span
                    className="px-4 py-2 rounded-full text-sm font-bold"
                    style={{ background: typeColors[opportunity.type] || '#666', color: '#fff' }}
                  >
                    {opportunity.type}
                  </span>
                  {opportunity.matchScore && (
                    <span
                      className="px-4 py-2 rounded-full text-sm font-bold"
                      style={{
                        background: opportunity.matchScore >= 80 ? '#22C55E' : opportunity.matchScore >= 60 ? '#D8A11F' : '#F59E0B',
                        color: '#fff'
                      }}
                    >
                      {opportunity.matchScore}% Match
                    </span>
                  )}
                  {opportunity.category && (
                    <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: '#D8A11F', color: '#fff' }}>
                      {opportunity.category}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-4" style={{ color: '#000' }}>
                  {opportunity.title}
                </h1>

                {/* Investment Amount */}
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="w-6 h-6" style={{ color: '#22C55E' }} />
                  <span className="text-2xl font-bold" style={{ color: '#22C55E' }}>
                    {opportunity.investment}
                  </span>
                </div>

                {/* Description */}
                <div className="p-6 rounded-2xl mb-6" style={{ background: '#fff', border: '1px solid #000' }}>
                  <h3 className="font-bold mb-3" style={{ color: '#000' }}>Description</h3>
                  <p style={{ color: '#666' }}>{opportunity.description}</p>
                  {opportunity.type === "Real Estate" && (
                    <p className="mt-3" style={{ color: '#666' }}>
                      This property offers excellent investment potential in a prime location. Features include modern amenities, 
                      convenient access to transportation, and is located in a growing neighborhood with strong market fundamentals.
                    </p>
                  )}
                </div>

                {/* Match Explanation (for AI-matched opportunities) */}
                {opportunity.matchExplanation && (
                  <div className="p-6 rounded-2xl mb-6" style={{ background: '#FEF3C7', border: '1px solid #D8A11F' }}>
                    <div className="flex items-start gap-2 mb-3">
                      <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#D8A11F' }} />
                      <h3 className="font-bold" style={{ color: '#000' }}>Why This Matches You</h3>
                    </div>
                    <p className="mb-3" style={{ color: '#000' }}>{opportunity.matchExplanation}</p>
                    {opportunity.matchReasons && opportunity.matchReasons.length > 0 && (
                      <ul className="space-y-2">
                        {opportunity.matchReasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2" style={{ color: '#000' }}>
                            <TrendingUp className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#22C55E' }} />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Key Details */}
                <div className="p-6 rounded-2xl mb-6" style={{ background: '#fff', border: '1px solid #000' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#000' }}>Key Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5" style={{ color: '#666' }} />
                      <div>
                        <span className="text-sm font-medium" style={{ color: '#000' }}>Posted Date</span>
                        <p className="text-sm" style={{ color: '#666' }}>{opportunity.postedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5" style={{ color: '#666' }} />
                      <div>
                        <span className="text-sm font-medium" style={{ color: '#000' }}>Partners</span>
                        <p className="text-sm" style={{ color: '#666' }}>{opportunity.partners}</p>
                      </div>
                    </div>
                    {opportunity.industry && (
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5" style={{ color: '#666' }} />
                        <div>
                          <span className="text-sm font-medium" style={{ color: '#000' }}>Industry</span>
                          <p className="text-sm" style={{ color: '#666' }}>{opportunity.industry}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#000' }}>Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5" style={{ color: '#D8A11F' }} />
                      <a href="mailto:contact@opportunity.com" className="text-sm hover:underline" style={{ color: '#D8A11F' }}>
                        contact@opportunity.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5" style={{ color: '#D8A11F' }} />
                      <a href="tel:+1234567890" className="text-sm hover:underline" style={{ color: '#D8A11F' }}>
                        +1 (234) 567-8900
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5" style={{ color: '#D8A11F' }} />
                      <a href="#" className="text-sm hover:underline" style={{ color: '#D8A11F' }}>
                        www.opportunity.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full mt-6 rounded-xl py-6 text-lg font-bold"
                  style={{ background: '#D8A11F', color: '#fff' }}
                >
                  Express Interest
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}