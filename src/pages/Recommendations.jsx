import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Briefcase, Heart, UserPlus, Loader2 } from "lucide-react";
import ConnectionCard from "@/components/recommendations/ConnectionCard";
import OpportunityRecommendationCard from "@/components/recommendations/OpportunityRecommendationCard";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";



export default function Recommendations() {
  const [activeTab, setActiveTab] = useState("connections");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAiMatches, setLoadingAiMatches] = useState(false);
  const [savedMatches, setSavedMatches] = useState([]);
  const [sendingRequest, setSendingRequest] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      // Load persisted AI matches
      if (user.ai_matches_json) {
        try {
          const parsed = JSON.parse(user.ai_matches_json);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedMatches(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved matches:', e);
        }
      }
    }).catch(() => setCurrentUser(null));
  }, []);

  // Fetch existing connections via backend (non-admin users can't list connections directly)
  const { data: connectionsData } = useQuery({
    queryKey: ['connections-data'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getConnectionsData', {});
      return res.data;
    },
    enabled: !!currentUser,
  });

  const existingConnections = connectionsData?.connections || [];

  // Build a set of emails we already have connections with (pending or connected)
  const connectedEmails = React.useMemo(() => {
    if (!currentUser) return new Set();
    const emails = new Set();
    existingConnections.forEach(c => {
      if (c.user1_email === currentUser.email) emails.add(c.user2_email);
      if (c.user2_email === currentUser.email) emails.add(c.user1_email);
    });
    return emails;
  }, [existingConnections, currentUser]);

  // Filtered matches: remove anyone we already have a connection with
  const filteredMatches = React.useMemo(() => {
    return savedMatches.filter(m => !connectedEmails.has(m.email) && (m.match_score || 0) >= 80);
  }, [savedMatches, connectedEmails]);

  // Fetch user interests
  const { data: userInterests = [] } = useQuery({
    queryKey: ['userInterests', currentUser?.email],
    queryFn: () => base44.entities.Interest.filter({ user_email: currentUser.email, status: 'approved' }),
    enabled: !!currentUser,
  });

  // Fetch AI-recommended opportunities
  const { data: aiOpportunities, refetch: refetchAiOpportunities } = useQuery({
    queryKey: ['aiOpportunities', currentUser?.email],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAIRecommendedOpportunities', {});
      return response.data;
    },
    enabled: false,
  });

  const [loadingAiOpportunities, setLoadingAiOpportunities] = useState(false);

  const handleGenerateAiOpportunities = async () => {
    setLoadingAiOpportunities(true);
    await refetchAiOpportunities();
    setLoadingAiOpportunities(false);
  };

  // Fetch real estate and franchise cache
  const { data: realEstateCacheData } = useQuery({
    queryKey: ['realEstateCacheRec'],
    queryFn: () => base44.entities.RealEstateCache.list('-created_date', 1),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000,
  });

  const { data: franchiseCacheData } = useQuery({
    queryKey: ['franchiseCacheRec'],
    queryFn: () => base44.entities.FranchiseCache.list('-created_date', 1),
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch opportunities matched to user interests with real match scores (all sources)
  const { data: matchedOpportunities = [], isLoading: loadingOpportunities } = useQuery({
    queryKey: ['matchedOpportunities', currentUser?.email, userInterests.length, realEstateCacheData?.[0]?.id, franchiseCacheData?.[0]?.id],
    queryFn: async () => {
      const dbOpps = await base44.entities.Opportunity.list();
      
      const realEstateOpps = (realEstateCacheData?.[0]?.opportunities || []).map(opp => ({
        id: opp.id || `re_${opp.title?.substring(0,10)}`,
        title: opp.title,
        description: opp.description,
        category: opp.type || 'Real Estate',
        image_url: opp.image,
        created_by: 'Real Estate Listing',
        related_interests: ['real estate', 'investment', 'property'],
      }));

      const franchiseOpps = (franchiseCacheData?.[0]?.opportunities || []).map(opp => ({
        id: opp.id || `fr_${opp.title?.substring(0,10)}`,
        title: opp.title,
        description: opp.description,
        category: 'Franchise',
        image_url: opp.image,
        created_by: 'Franchise Listing',
        related_interests: ['franchise', 'business', 'entrepreneurship'],
      }));

      const allOpportunities = [...dbOpps, ...realEstateOpps, ...franchiseOpps];

      if (userInterests.length === 0) {
        return allOpportunities.map(opp => ({ ...opp, matchPercentage: 0 }));
      }
      
      const interestNames = userInterests.map(i => i.interest_name.toLowerCase());
      
      const scored = allOpportunities.map(opp => {
        const oppText = `${opp.title || ''} ${opp.description || ''} ${opp.category || ''} ${(opp.related_interests || []).join(' ')}`.toLowerCase();
        
        // Count how many user interests match this opportunity
        const matchingInterests = interestNames.filter(interest => {
          const words = interest.split(/\s+/);
          return words.some(w => w.length > 2 && oppText.includes(w)) || oppText.includes(interest);
        });
        
        // Score: percentage of user interests that match this opportunity
        const matchPercentage = Math.round((matchingInterests.length / interestNames.length) * 100);
        return { ...opp, matchPercentage, matchCount: matchingInterests.length };
      });
      
      return scored
        .filter(opp => opp.matchPercentage >= 80)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
    },
    enabled: !!currentUser && userInterests !== undefined && realEstateCacheData !== undefined && franchiseCacheData !== undefined,
  });

  // Use saved matches from user record (persisted across refreshes)
  // Non-admin users can't list other users, so we rely on AI matches from backend

  // Fetch AI-matched connections
  const { data: aiMatches, isLoading: loadingAiMatchesQuery, refetch: refetchAiMatches } = useQuery({
    queryKey: ['aiMatches', currentUser?.email],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiMatchmaker', {});
      return response.data;
    },
    enabled: false, // Don't auto-fetch, user triggers it
  });

  const handleGenerateAiMatches = async () => {
    setLoadingAiMatches(true);
    try {
      const result = await refetchAiMatches();
      const data = result?.data;
      if (data?.success && data.matches?.length > 0) {
        setSavedMatches(data.matches);
        await base44.auth.updateMe({
          ai_matches_json: JSON.stringify(data.matches),
          ai_matches_date: new Date().toISOString()
        });
        toast.success(`Found ${data.matches.length} recommended connections!`);
      } else if (data?.success && data.matches?.length === 0) {
        toast.info('No strong matches found at this time. Try adding more interests to your profile.');
      } else if (!data?.success) {
        toast.error(data?.error || 'Failed to generate matches. Please try again.');
      }
    } catch (e) {
      console.error('Failed to generate matches:', e);
      toast.error('Failed to generate matches. Please try again.');
    }
    setLoadingAiMatches(false);
  };

  // Connection mutation
  const connectMutation = useMutation({
    mutationFn: async (targetEmail) => {
      return await base44.entities.Connection.create({
        user1_email: currentUser.email,
        user2_email: targetEmail,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-data'] });
    },
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{ minHeight: 'calc(100vh - 73px)', background: '#F2F1F5' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#3B82F6' }} />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#000' }}>
                AI Recommendations
              </h1>
            </div>
            <p className="text-sm sm:text-base" style={{ color: '#000' }}>
              Based on your profile and goals, we've found potential partners and opportunities.
            </p>
          </div>



          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Button
              onClick={() => setActiveTab("connections")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 touch-target ${
                activeTab === "connections" ? 'shadow-lg' : ''
              }`}
              style={
                activeTab === "connections"
                  ? { background: '#6366F1', color: '#fff' }
                  : { background: 'rgba(255, 255, 255, 0.08)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.1)' }
              }
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Potential Connections ({filteredMatches.length})</span>
              <span className="sm:hidden">Connections ({filteredMatches.length})</span>
            </Button>
            <Button
              onClick={() => setActiveTab("opportunities")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 touch-target ${
                activeTab === "opportunities" ? 'shadow-lg' : ''
              }`}
              style={
                activeTab === "opportunities"
                  ? { background: '#6366F1', color: '#fff' }
                  : { background: 'rgba(255, 255, 255, 0.08)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.1)' }
              }
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Top Opportunities ({matchedOpportunities.length})</span>
              <span className="sm:hidden">Opportunities ({matchedOpportunities.length})</span>
            </Button>
          </div>

          {/* Content */}
          {activeTab === "connections" ? (
            <>
              {/* AI Matchmaker Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: '#000' }}>
                        AI Recommended Connections
                      </h2>
                      <p className="text-sm" style={{ color: '#666' }}>
                        Generated based on your profile, business goals, and interests
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateAiMatches}
                    disabled={loadingAiMatches || loadingAiMatchesQuery}
                    className="gap-2 rounded-xl"
                    style={{ background: '#D8A11F', color: '#fff' }}
                  >
                    {loadingAiMatches || loadingAiMatchesQuery ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Matches
                      </>
                    )}
                  </Button>
                </div>

                {savedMatches.length > 0 && filteredMatches.length === 0 ? (
                  <div className="text-center py-12 rounded-xl" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
                    <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#22C55E' }} />
                    <p className="text-lg font-semibold mb-2" style={{ color: '#000' }}>
                      You're already connected!
                    </p>
                    <p className="text-sm mb-4" style={{ color: '#666' }}>
                      All {savedMatches.length} AI-recommended matches are already in your connections or have pending requests.
                    </p>
                    <Button
                      onClick={handleGenerateAiMatches}
                      disabled={loadingAiMatches || loadingAiMatchesQuery}
                      className="gap-2 rounded-xl"
                      style={{ background: '#D8A11F', color: '#fff' }}
                    >
                      {loadingAiMatches ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate New Matches</>
                      )}
                    </Button>
                  </div>
                ) : filteredMatches.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredMatches.map((match, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl p-6 flex flex-col items-center"
                          style={{ background: '#1E293B', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        >
                          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4" style={{ borderColor: '#334155' }}>
                            <img
                              src={match.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name)}&size=200&background=random`}
                              alt={match.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2 text-center" style={{ color: '#fff' }}>
                            {match.name}
                          </h3>
                          
                          <Badge className="mb-3" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                            {match.role || 'General User'}
                          </Badge>
                          
                          <p className="text-sm text-center mb-4 min-h-[40px]" style={{ color: '#CBD5E1' }}>
                            {match.overview || 'No bio available.'}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-4 h-4" style={{ color: '#EF4444' }} />
                            <span className="font-semibold" style={{ color: '#EF4444' }}>
                              {match.match_score}% Match
                            </span>
                          </div>
                          
                          <Button
                            onClick={async () => {
                              if (sendingRequest === match.email) return;
                              setSendingRequest(match.email);
                              try {
                                // Check if connection already exists
                                const existing = existingConnections.find(c =>
                                  (c.user1_email === currentUser.email && c.user2_email === match.email) ||
                                  (c.user1_email === match.email && c.user2_email === currentUser.email)
                                );
                                if (existing) {
                                  toast.info('You already have a connection or pending request with this user.');
                                  // Remove from matches list anyway
                                  const updatedMatches = savedMatches.filter(m => m.email !== match.email);
                                  setSavedMatches(updatedMatches);
                                  await base44.auth.updateMe({ ai_matches_json: JSON.stringify(updatedMatches) });
                                  setSendingRequest(null);
                                  return;
                                }
                                await base44.entities.Connection.create({
                                  user1_email: currentUser.email,
                                  user2_email: match.email,
                                  status: 'pending'
                                });
                                // Send notification (don't let failure block the flow)
                                base44.functions.invoke('sendNotification', {
                                  recipientEmail: match.email,
                                  type: 'connection_request',
                                  title: '\ud83d\udc4b New Connection Request',
                                  message: `${currentUser.full_name} wants to connect with you`,
                                  link: `/Profile?email=${currentUser.email}`,
                                  sendEmail: true
                                }).catch(e => console.warn('Notification send failed:', e));
                                queryClient.invalidateQueries({ queryKey: ['connections-data'] });
                                const updatedMatches = savedMatches.filter(m => m.email !== match.email);
                                setSavedMatches(updatedMatches);
                                await base44.auth.updateMe({
                                  ai_matches_json: JSON.stringify(updatedMatches)
                                });
                                toast.success(`Connection request sent to ${match.name}!`);
                              } catch (error) {
                                console.error('Failed to send connection request:', error);
                                toast.error('Failed to send request. Please try again.');
                              } finally {
                                setSendingRequest(null);
                              }
                            }}
                            disabled={sendingRequest === match.email}
                            className="w-full rounded-xl gap-2 font-semibold"
                            style={{ background: '#D8A11F', color: '#1E293B' }}
                          >
                            {sendingRequest === match.email ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                            ) : (
                              <><UserPlus className="w-4 h-4" /> Connect</>
                            )}
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : aiMatches && !aiMatches.success ? (
                  <div className="text-center py-8 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <p style={{ color: '#EF4444' }}>{aiMatches.error || 'Failed to generate AI matches'}</p>
                  </div>
                ) : savedMatches.length === 0 && !aiMatches ? (
                  <div className="text-center py-12 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#D8A11F' }} />
                    <p className="text-lg font-semibold mb-2" style={{ color: '#000' }}>
                      Discover Your Perfect Connections
                    </p>
                    <p className="text-sm" style={{ color: '#666' }}>
                      Click "Generate Matches" to find AI-recommended connections based on your profile
                    </p>
                  </div>
                ) : null}
              </div>

              </>

          ) : (
            <div>
              {/* AI Recommended Opportunities */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: '#000' }}>
                        AI Recommended Opportunities
                      </h2>
                      <p className="text-sm" style={{ color: '#666' }}>
                        Personalized based on your profile, interests, and partnership history
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateAiOpportunities}
                    disabled={loadingAiOpportunities}
                    className="gap-2 rounded-xl"
                    style={{ background: '#D8A11F', color: '#fff' }}
                  >
                    {loadingAiOpportunities ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Get AI Recommendations
                      </>
                    )}
                  </Button>
                </div>

                {aiOpportunities?.success && aiOpportunities.recommendations?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {aiOpportunities.recommendations.map((opp, idx) => (
                      <OpportunityRecommendationCard
                        key={opp.id}
                        opportunity={{
                          id: opp.id,
                          title: opp.title,
                          category: opp.category || "General",
                          description: opp.description,
                          image: opp.image_url || "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop",
                          createdBy: "AI Recommended",
                          matchPercentage: opp.match_score,
                          matchReason: opp.match_reason,
                          opportunityId: opp.id,
                        }}
                        index={idx}
                      />
                    ))}
                  </div>
                ) : aiOpportunities && !aiOpportunities.success ? (
                  <div className="text-center py-8 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <p style={{ color: '#EF4444' }}>{aiOpportunities.error || 'Failed to generate AI recommendations'}</p>
                  </div>
                ) : !aiOpportunities ? (
                  <div className="text-center py-12 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#D8A11F' }} />
                    <p className="text-lg font-semibold mb-2" style={{ color: '#000' }}>
                      Discover Your Perfect Opportunities
                    </p>
                    <p className="text-sm" style={{ color: '#666' }}>
                      Click "Get AI Recommendations" to find opportunities tailored to your profile
                    </p>
                  </div>
                ) : null}
              </div>

              {/* All Opportunities */}
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ color: '#000' }}>
                  All Matched Opportunities
                </h2>
                {loadingOpportunities ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" style={{ color: '#D8A11F' }} />
                    <p className="text-sm sm:text-base" style={{ color: '#000' }}>Loading matched opportunities...</p>
                  </div>
                ) : matchedOpportunities.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {matchedOpportunities.map((opportunity, index) => (
                    <OpportunityRecommendationCard 
                      key={opportunity.id} 
                      opportunity={{
                        id: opportunity.id,
                        title: opportunity.title,
                        category: opportunity.category || "General",
                        description: opportunity.description,
                        image: opportunity.image_url || "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop",
                        createdBy: opportunity.created_by || "Admin",
                        matchPercentage: opportunity.matchPercentage,
                        opportunityId: opportunity.id,
                      }} 
                      index={index} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#D8A11F' }} />
                  <p className="text-lg font-semibold mb-2" style={{ color: '#000' }}>
                    No opportunities available yet
                  </p>
                  <p className="text-sm" style={{ color: '#666' }}>
                    Complete your profile and add interests to get personalized recommendations
                  </p>
                </div>
              )}
              </div>
              </div>
              )}
              </div>
              </main>
              </div>
              );
              }