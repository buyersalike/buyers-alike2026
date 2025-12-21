import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, UserPlus, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecommendedPartners({ currentUser }) {
  const [loadingConnection, setLoadingConnection] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['recommendedPartners', currentUser?.email],
    queryFn: async () => {
      const response = await base44.functions.invoke('getRecommendedPartners', {});
      return response.data;
    },
    enabled: !!currentUser,
  });

  const sendConnectionMutation = useMutation({
    mutationFn: async (partnerEmail) => {
      setLoadingConnection(partnerEmail);
      await base44.entities.Connection.create({
        user1_email: currentUser.email,
        user2_email: partnerEmail,
        status: 'pending'
      });
      await base44.entities.Notification.create({
        recipient_email: partnerEmail,
        type: 'connection_request',
        title: '🤝 New Connection Request',
        message: `${currentUser.full_name} wants to connect with you`,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        link: '/Connections',
        read: false,
        email_sent: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendedPartners'] });
      setLoadingConnection(null);
    },
    onError: () => {
      setLoadingConnection(null);
    }
  });

  if (!currentUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl"
      style={{ background: '#fff', border: '2px solid #000' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#D8A11F' }}>
            <Sparkles className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
              AI Recommended Partners
            </h2>
            <p className="text-sm" style={{ color: '#666' }}>
              Perfect matches for collaboration
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate(createPageUrl('AIMatchmaker'))}
          variant="ghost"
          className="gap-2"
          style={{ color: '#D8A11F' }}
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D8A11F' }} />
        </div>
      ) : recommendations?.recommendations?.length > 0 ? (
        <div className="space-y-4">
          {recommendations.recommendations.slice(0, 3).map((rec, index) => (
            <motion.div
              key={rec.partner_email}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-2xl border-2 hover:shadow-md transition-all"
              style={{ background: '#f5f5f5', borderColor: '#000' }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D8A11F' }}>
                  <Users className="w-7 h-7" style={{ color: '#fff' }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate" style={{ color: '#000' }}>
                        {rec.partner?.full_name || 'Partner'}
                      </h3>
                      <p className="text-sm truncate" style={{ color: '#666' }}>
                        {rec.partner?.title || rec.partner?.occupation}
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold ml-2 flex-shrink-0"
                      style={{
                        background: rec.match_score >= 0.8 ? '#22C55E' : rec.match_score >= 0.6 ? '#D8A11F' : '#3B82F6',
                        color: '#fff'
                      }}
                    >
                      {Math.round(rec.match_score * 100)}% Match
                    </div>
                  </div>

                  <p className="text-sm font-semibold mb-2" style={{ color: '#000' }}>
                    {rec.headline}
                  </p>

                  <p className="text-sm mb-3 line-clamp-2" style={{ color: '#666' }}>
                    {rec.reasoning}
                  </p>

                  {rec.synergy_factors?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.synergy_factors.slice(0, 2).map((factor, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(216, 161, 31, 0.1)', color: '#000' }}
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => sendConnectionMutation.mutate(rec.partner_email)}
                    disabled={loadingConnection === rec.partner_email}
                    size="sm"
                    className="gap-2"
                    style={{ background: '#D8A11F', color: '#fff' }}
                  >
                    {loadingConnection === rec.partner_email ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: '#666' }} />
          <p style={{ color: '#666' }}>No recommendations available yet</p>
          <Button
            onClick={() => refetch()}
            size="sm"
            className="mt-4 gap-2"
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            <TrendingUp className="w-4 h-4" />
            Generate Recommendations
          </Button>
        </div>
      )}
    </motion.div>
  );
}