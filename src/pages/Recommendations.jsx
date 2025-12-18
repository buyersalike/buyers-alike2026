import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Briefcase, Store } from "lucide-react";
import ConnectionCard from "@/components/recommendations/ConnectionCard";
import OpportunityRecommendationCard from "@/components/recommendations/OpportunityRecommendationCard";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: 'calc(100vh - 73px)', background: '#F2F1F5' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8" style={{ color: '#3B82F6' }} />
              <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#000' }}>
                AI-Powered Recommendations
              </h1>
            </div>
            <p style={{ color: '#000' }}>
              Based on your profile and goals, we've found potential partners and opportunities.
            </p>
          </div>

          {/* AI Insights */}
          {aiRecommendations?.success && aiRecommendations.recommendations.forumTopics?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
          <div className="flex gap-3 mb-8">
            <Button
              onClick={() => setActiveTab("connections")}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "connections" ? 'shadow-lg' : ''
              }`}
              style={
                activeTab === "connections"
                  ? { background: '#6366F1', color: '#fff' }
                  : { background: 'rgba(255, 255, 255, 0.08)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.1)' }
              }
            >
              <Users className="w-5 h-5 mr-2" />
              Potential Connections (20)
            </Button>
            <Button
              onClick={() => setActiveTab("opportunities")}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === "opportunities" ? 'shadow-lg' : ''
              }`}
              style={
                activeTab === "opportunities"
                  ? { background: '#6366F1', color: '#fff' }
                  : { background: 'rgba(255, 255, 255, 0.08)', color: '#B6C4E0', border: '1px solid rgba(255, 255, 255, 0.1)' }
              }
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Top Opportunities (120)
            </Button>
          </div>

          {/* Content */}
          {activeTab === "connections" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectionsData.map((connection, index) => (
                <ConnectionCard key={connection.id} connection={connection} index={index} />
              ))}
            </div>
          ) : (
            <>
              {loadingAI ? (
                <div className="text-center py-12">
                  <p style={{ color: '#000' }}>Loading AI recommendations...</p>
                </div>
              ) : aiRecommendations?.success && aiRecommendations.recommendations.opportunities?.length > 0 && (
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5" style={{ color: '#7C3AED' }} />
                    <h3 className="text-lg font-bold" style={{ color: '#000' }}>AI-Recommended for You</h3>
                  </div>
                  {aiRecommendations.recommendations.opportunities.map((opp, idx) => (
                    <div key={idx} className="glass-card glass-card-hover p-6">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>{opp.title}</h3>
                      <p className="mb-3" style={{ color: '#000' }}>{opp.description}</p>
                      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                        <Sparkles className="w-4 h-4 mt-0.5" style={{ color: '#7C3AED' }} />
                        <p className="text-sm" style={{ color: '#000' }}>{opp.relevanceReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunitiesData.map((opportunity, index) => (
                  <OpportunityRecommendationCard key={opportunity.id} opportunity={opportunity} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}