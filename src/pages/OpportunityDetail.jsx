import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Users, TrendingUp, Sparkles, Mail, Phone, Globe, DollarSign, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import ExpressInterestDialog from "@/components/opportunities/ExpressInterestDialog";

export default function OpportunityDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const opportunity = location.state?.opportunity;

  const typeColors = {
    "Real Estate": "#3B82F6",
    "Franchise": "#8B5CF6",
    "Business": "#10B981",
    "Partnership": "#F59E0B",
    "Investment": "#EF4444",
  };

  // Use actual listing photos if available, otherwise fall back to single image
  const additionalImages = (() => {
    if (opportunity?.images && opportunity.images.length > 0) return opportunity.images;
    if (opportunity?.image) return [opportunity.image];
    return [];
  })();

  const [selectedImage, setSelectedImage] = useState(additionalImages[0]);
  const [currentUser, setCurrentUser] = useState(null);
  const [aiMatchData, setAiMatchData] = useState(null);
  const [loadingAiMatch, setLoadingAiMatch] = useState(false);
  const [showInterestDialog, setShowInterestDialog] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    const fetchAiMatch = async () => {
      if (!currentUser || !opportunity?.id) return;
      
      setLoadingAiMatch(true);
      try {
        const response = await base44.functions.invoke('getOpportunityMatchReason', {
          opportunityId: opportunity.id
        });
        if (response.data.success) {
          setAiMatchData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch AI match data:', error);
      } finally {
        setLoadingAiMatch(false);
      }
    };

    fetchAiMatch();
  }, [currentUser, opportunity?.id]);

  const opportunityLink = opportunity?.link || opportunity?.source_url || opportunity?.contact?.website || null;

  const expressInterestMutation = useMutation({
    mutationFn: async (formData) => {
      if (!currentUser) {
        throw new Error("Please log in to express interest");
      }

      let groupId = null;
      let groupName = null;
      let status = "intent_created";

      if (formData.mode === 'join') {
        // Join existing group
        const group = formData.group;
        groupId = group.id;
        groupName = group.name;
        status = "pending_group_join";

        const pendingMembers = [...(group.pending_members || []), {
          email: currentUser.email,
          name: currentUser.full_name,
          requested_date: new Date().toISOString()
        }];

        await base44.entities.PartnershipGroup.update(group.id, {
          pending_members: pendingMembers
        });
      } else {
        // Create new group with user-specified settings
        const newGroup = await base44.entities.PartnershipGroup.create({
          name: formData.groupTitle,
          opportunity_id: opportunity.id || opportunity.title,
          opportunity_name: opportunity.title,
          opportunity_description: opportunity.description,
          opportunity_link: opportunityLink || '',
          opportunity_image: opportunity.image || '',
          opportunity_investment: opportunity.investment || '',
          opportunity_type: opportunity.type || '',
          group_intent: formData.groupIntent || '',
          creator_email: currentUser.email,
          max_members: formData.maxMembers,
          members: [{
            email: currentUser.email,
            name: currentUser.full_name,
            joined_date: new Date().toISOString(),
            status: "active"
          }],
          status: "forming"
        });
        groupId = newGroup.id;
        groupName = newGroup.name;
        status = "accepted_into_group";
      }

      return await base44.entities.PartnershipIntent.create({
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        opportunity_id: opportunity.id || opportunity.title,
        opportunity_name: opportunity.title,
        opportunity_description: opportunity.description,
        current_status: status,
        group_id: groupId,
        group_name: groupName,
        status_history: [{
          status: status,
          timestamp: new Date().toISOString(),
          notes: status === "accepted_into_group"
            ? "Created new partnership group" 
            : "Requested to join existing partnership group"
        }]
      });
    },
    onSuccess: (data) => {
      setShowInterestDialog(false);
      if (data.current_status === "accepted_into_group") {
        toast.success("Partnership group created! You're the first member.");
      } else {
        toast.success("Join request submitted! Waiting for group approval.");
      }
      navigate(createPageUrl('Partnerships'));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit interest");
    },
  });

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

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: '100vh', background: '#F2F1F5' }}>
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate(createPageUrl('Opportunities'))}
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
              {/* AI Match Analysis */}
              {aiMatchData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl mb-6"
                  style={{ background: 'linear-gradient(135deg, rgba(216, 161, 31, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)', border: '2px solid #D8A11F' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}>
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: '#000' }}>
                          AI Match Analysis
                        </h3>
                        <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: '#D8A11F', color: '#fff' }}>
                          {aiMatchData.match_score}% Match
                        </span>
                      </div>
                      <p className="mb-4 leading-relaxed text-sm" style={{ color: '#000' }}>
                        {aiMatchData.match_explanation}
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold text-xs" style={{ color: '#000' }}>Key Alignment Factors:</p>
                        {aiMatchData.alignment_factors?.map((factor, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                            <span className="text-xs" style={{ color: '#000' }}>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {loadingAiMatch && (
                <div className="p-4 rounded-2xl mb-6 flex items-center gap-3" style={{ background: '#fff', border: '1px solid #000' }}>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#D8A11F' }} />
                  <span className="text-sm" style={{ color: '#666' }}>Analyzing match compatibility...</span>
                </div>
              )}

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

                {/* Franchise Financial Details */}
                {opportunity.type === 'Franchise' && (opportunity.liquidCapital || opportunity.franchiseFee || opportunity.totalInvestment) && (
                  <div className="p-6 rounded-2xl mb-6" style={{ background: '#fff', border: '1px solid #000' }}>
                    <h3 className="font-bold mb-4" style={{ color: '#000' }}>Capital Requirements</h3>
                    <div className="space-y-3">
                      {opportunity.liquidCapital && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium" style={{ color: '#666' }}>Liquid Capital</span>
                          <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{opportunity.liquidCapital}</span>
                        </div>
                      )}
                      {opportunity.franchiseFee && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium" style={{ color: '#666' }}>Franchise Fee</span>
                          <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{opportunity.franchiseFee}</span>
                        </div>
                      )}
                      {opportunity.totalInvestment && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium" style={{ color: '#666' }}>Total Investment</span>
                          <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{opportunity.totalInvestment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
                  <h3 className="font-bold mb-4" style={{ color: '#000' }}>Contact Information</h3>
                  <div className="space-y-3">
                    {opportunity.contact?.name && (
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" style={{ color: '#D8A11F' }} />
                        <span className="text-sm" style={{ color: '#000' }}>{opportunity.contact.name}{opportunity.contact.office ? ` — ${opportunity.contact.office}` : ''}</span>
                      </div>
                    )}
                    {opportunity.contact?.email ? (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5" style={{ color: '#D8A11F' }} />
                        <a href={`mailto:${opportunity.contact.email}`} className="text-sm hover:underline" style={{ color: '#D8A11F' }}>
                          {opportunity.contact.email}
                        </a>
                      </div>
                    ) : opportunity.contact && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5" style={{ color: '#D8A11F' }} />
                        <span className="text-sm" style={{ color: '#666' }}>Email not available</span>
                      </div>
                    )}
                    {opportunity.contact?.phone ? (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5" style={{ color: '#D8A11F' }} />
                        <a href={`tel:${opportunity.contact.phone}`} className="text-sm hover:underline" style={{ color: '#D8A11F' }}>
                          {opportunity.contact.phone}
                        </a>
                      </div>
                    ) : opportunity.contact && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5" style={{ color: '#D8A11F' }} />
                        <span className="text-sm" style={{ color: '#666' }}>Phone not available</span>
                      </div>
                    )}
                    {opportunity.contact?.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5" style={{ color: '#D8A11F' }} />
                        <a href={opportunity.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: '#D8A11F' }}>
                          {opportunity.contact.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {opportunity.link && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5" style={{ color: '#D8A11F' }} />
                        <a href={opportunity.link} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: '#D8A11F' }}>
                          View on FranchiseGator
                        </a>
                      </div>
                    )}
                    {!opportunity.contact && !opportunity.link && (
                      <p className="text-sm" style={{ color: '#666' }}>Contact information not available</p>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => setShowInterestDialog(true)}
                  className="w-full mt-6 rounded-xl py-6 text-lg font-bold"
                  style={{ background: '#D8A11F', color: '#fff' }}
                >
                  Express Interest
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <ExpressInterestDialog
          open={showInterestDialog}
          onOpenChange={setShowInterestDialog}
          opportunity={opportunity}
          currentUser={currentUser}
          onSubmit={(formData) => expressInterestMutation.mutate(formData)}
          isPending={expressInterestMutation.isPending}
        />
      </main>
    </div>
  );
}