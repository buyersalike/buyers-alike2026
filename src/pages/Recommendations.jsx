import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Briefcase, Store, Heart, UserPlus, Loader2 } from "lucide-react";
import ConnectionCard from "@/components/recommendations/ConnectionCard";
import OpportunityRecommendationCard from "@/components/recommendations/OpportunityRecommendationCard";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const connectionsData = [
  {
    id: 1,
    name: "Jeremiah Bandele",
    role: "General User",
    bio: "Coding is everything, maybe not really",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    matchPercentage: 23,
  },
  {
    id: 2,
    name: "ebubechukwu okeke",
    role: "General User",
    bio: "No bio available.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    matchPercentage: 23,
  },
  {
    id: 3,
    name: "realo",
    role: "General User",
    bio: "No bio available.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    matchPercentage: 15,
  },
  {
    id: 4,
    name: "Olajide Oni",
    role: "General User",
    bio: "No bio available.",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
    matchPercentage: 15,
  },
  {
    id: 5,
    name: "isras",
    role: "General User",
    bio: "No bio available.",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    matchPercentage: 15,
  },
  {
    id: 6,
    name: "oyetu",
    role: "General User",
    bio: "No bio available.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    matchPercentage: 8,
  },
  {
    id: 7,
    name: "aremi",
    role: "General User",
    bio: "No bio available.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    matchPercentage: 8,
  },
  {
    id: 8,
    name: "israe",
    role: "General User",
    bio: "No bio available.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    matchPercentage: 8,
  },
  {
    id: 9,
    name: "Bayo Ade",
    role: "General User",
    bio: "Test description",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop",
    matchPercentage: 8,
  },
];

const opportunitiesData = [
  {
    id: 1,
    title: "Yogen Früz Franchise Opportunity",
    category: "General",
    description: "Canadian frozen yogurt pioneer with healthy menu options. Flexible store formats and strong international presence.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 2,
    title: "Tim Hortons Franchise Opportunity",
    category: "General",
    description: "Canada's most iconic coffee and baked goods chain with over 5,000 locations worldwide. Offering comprehensive training, strong brand...",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 3,
    title: "Anytime Fitness Franchise Opportunity",
    category: "General",
    description: "24/7 fitness club with global membership access. Compact facility model with recurring memberships and strong brand.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 4,
    title: "Mary Brown's Chicken Franchise...",
    category: "General",
    description: "Canadian chicken franchise with signature recipes and strong Atlantic Canada presence. Expanding nationally with proven systems.",
    image: "https://images.unsplash.com/photo-1562158147-f89bc2368a26?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 5,
    title: "Merry Maids Franchise Opportunity",
    category: "General",
    description: "Residential cleaning services with proven systems and strong brand. Home-based business with recurring revenue model.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 6,
    title: "McDonald's Canada Franchise...",
    category: "General",
    description: "World-renowned fast-food franchise with comprehensive training, marketing support, and global brand recognition. Join one of the most...",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 7,
    title: "Country Style Franchise Opportunity",
    category: "General",
    description: "Canadian coffee and donut chain with strong brand recognition in Ontario. Proven business model.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 8,
    title: "Orangetheory Fitness Franchise...",
    category: "General",
    description: "Heart-rate based interval training fitness concept with scientifically proven workouts and strong member retention.",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
  {
    id: 9,
    title: "Chem-Dry Carpet Cleaning Franchis...",
    category: "General",
    description: "World's leading carpet cleaning franchise with eco-friendly solutions and proven business systems.",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop",
    createdBy: "Aderemi Adefioye",
    matchPercentage: 36,
  },
];

export default function Recommendations() {
  const [activeTab, setActiveTab] = useState("connections");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAiMatches, setLoadingAiMatches] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: aiRecommendations, isLoading: loadingAI } = useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getPersonalizedRecommendations', {});
      return response.data;
    },
    enabled: !!currentUser,
  });

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
    await refetchAiMatches();
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
      queryClient.invalidateQueries({ queryKey: ['connections'] });
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

          {/* AI Insights */}
          {aiRecommendations?.success && aiRecommendations.recommendations.forumTopics?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {aiRecommendations.recommendations.forumTopics.slice(0, 2).map((topic, idx) => (
                <div key={idx} className="glass-card p-4" style={{ background: '#192234' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#D8A11F' }}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: '#fff' }}>{topic.topic}</h3>
                      <p className="text-sm" style={{ color: '#fff' }}>{topic.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
              <span className="hidden sm:inline">Potential Connections (20)</span>
              <span className="sm:hidden">Connections (20)</span>
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
              <span className="hidden sm:inline">Top Opportunities (120)</span>
              <span className="sm:hidden">Opportunities (120)</span>
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

                {aiMatches?.success && aiMatches.matches?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {aiMatches.matches.map((match, idx) => (
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
                          {match.bio || match.overview || 'No bio available.'}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <Heart className="w-4 h-4" style={{ color: '#EF4444' }} />
                          <span className="font-semibold" style={{ color: '#EF4444' }}>
                            {match.match_score}% Match
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => connectMutation.mutate(match.email)}
                          disabled={connectMutation.isPending}
                          className="w-full rounded-xl gap-2 font-semibold"
                          style={{ background: '#D8A11F', color: '#1E293B' }}
                        >
                          <UserPlus className="w-4 h-4" />
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : aiMatches && !aiMatches.success ? (
                  <div className="text-center py-8 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <p style={{ color: '#EF4444' }}>{aiMatches.error || 'Failed to generate AI matches'}</p>
                  </div>
                ) : !aiMatches ? (
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

              {/* Potential Connections Section */}
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ color: '#000' }}>
                  All Potential Connections
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {connectionsData.map((connection, index) => (
                    <ConnectionCard key={connection.id} connection={connection} index={index} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              {loadingAI ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" style={{ color: '#D8A11F' }} />
                  <p className="text-sm sm:text-base" style={{ color: '#000' }}>Loading AI-recommended opportunities...</p>
                </div>
              ) : aiRecommendations?.success && aiRecommendations.recommendations.opportunities?.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {aiRecommendations.recommendations.opportunities.map((opportunity, index) => (
                    <OpportunityRecommendationCard 
                      key={index} 
                      opportunity={{
                        id: index,
                        title: opportunity.title,
                        category: opportunity.category || "General",
                        description: opportunity.description,
                        image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop",
                        createdBy: "AI Recommended",
                        matchPercentage: opportunity.matchScore || 85,
                      }} 
                      index={index} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#D8A11F' }} />
                  <p className="text-lg font-semibold mb-2" style={{ color: '#000' }}>
                    No AI recommendations available yet
                  </p>
                  <p className="text-sm" style={{ color: '#666' }}>
                    Complete your profile to get personalized opportunity recommendations
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}