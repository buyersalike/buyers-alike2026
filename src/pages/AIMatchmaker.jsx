import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, TrendingUp, Users, Briefcase, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIMatchmaker() {
  const [currentUser, setCurrentUser] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const runAIMatchingMutation = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      const response = await base44.functions.invoke('aiMatchmaker', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiMatches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setAnalyzing(false);
    },
    onError: () => {
      setAnalyzing(false);
    }
  });

  const { data: matchData, isLoading, refetch } = useQuery({
    queryKey: ['aiMatches'],
    queryFn: async () => {
      const response = await base44.functions.invoke('aiMatchmaker', {});
      return response.data;
    },
    enabled: false,
  });

  const handleRunAnalysis = () => {
    refetch();
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#000' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}>
                <Sparkles className="w-8 h-8" style={{ color: '#fff' }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ color: '#000' }}>
                  AI Matchmaker
                </h1>
                <p className="text-lg" style={{ color: '#666' }}>
                  Let AI find your perfect opportunities and partners
                </p>
              </div>
            </div>
          </motion.div>

          {/* Analysis CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl mb-8 text-center"
            style={{ background: '#fff', border: '2px solid #000' }}
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: '#D8A11F' }} />
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#000' }}>
              Discover Your Perfect Matches
            </h2>
            <p className="text-lg mb-6" style={{ color: '#666' }}>
              Our AI analyzes your profile, interests, and goals to find the best opportunities and partners for you
            </p>
            <Button
              onClick={handleRunAnalysis}
              disabled={isLoading}
              size="lg"
              className="px-8 py-6 text-lg rounded-xl gap-2"
              style={{ background: '#D8A11F', color: '#fff' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {matchData && !isLoading && (
              <>
                {/* Stats Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-3 gap-6 mb-8"
                >
                  <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '2px solid #000' }}>
                    <Briefcase className="w-10 h-10 mb-3" style={{ color: '#D8A11F' }} />
                    <div className="text-3xl font-bold mb-1" style={{ color: '#000' }}>
                      {matchData.opportunity_matches?.length || 0}
                    </div>
                    <div style={{ color: '#666' }}>Opportunity Matches</div>
                  </div>
                  <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '2px solid #000' }}>
                    <Users className="w-10 h-10 mb-3" style={{ color: '#D8A11F' }} />
                    <div className="text-3xl font-bold mb-1" style={{ color: '#000' }}>
                      {matchData.partner_matches?.length || 0}
                    </div>
                    <div style={{ color: '#666' }}>Partner Matches</div>
                  </div>
                  <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '2px solid #000' }}>
                    <TrendingUp className="w-10 h-10 mb-3" style={{ color: '#D8A11F' }} />
                    <div className="text-3xl font-bold mb-1" style={{ color: '#000' }}>
                      {matchData.high_confidence_opportunities + matchData.high_confidence_partners}
                    </div>
                    <div style={{ color: '#666' }}>High Confidence</div>
                  </div>
                </motion.div>

                {/* Opportunity Matches */}
                {matchData.opportunity_matches?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#000' }}>
                      <Briefcase className="w-6 h-6" style={{ color: '#D8A11F' }} />
                      Top Opportunity Matches
                    </h2>
                    <div className="space-y-4">
                      {matchData.opportunity_matches.map((match, index) => (
                        <motion.div
                          key={match.opportunity_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          className="p-6 rounded-2xl"
                          style={{ background: '#fff', border: '2px solid #000' }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold" style={{ color: '#000' }}>
                                  Match #{index + 1}
                                </h3>
                                <div
                                  className="px-3 py-1 rounded-full text-sm font-bold"
                                  style={{
                                    background: match.confidence_score >= 0.8 ? '#22C55E' : match.confidence_score >= 0.6 ? '#D8A11F' : '#3B82F6',
                                    color: '#fff'
                                  }}
                                >
                                  {Math.round(match.confidence_score * 100)}% Match
                                </div>
                              </div>
                              <p className="text-lg font-semibold mb-2" style={{ color: '#666' }}>
                                {match.reasoning}
                              </p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-sm font-bold mb-2" style={{ color: '#000' }}>
                              Key Alignments:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {match.key_alignments?.map((alignment, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 rounded-lg text-sm"
                                  style={{ background: 'rgba(216, 161, 31, 0.1)', color: '#000', border: '1px solid #D8A11F' }}
                                >
                                  <CheckCircle className="w-3 h-3 inline mr-1" style={{ color: '#D8A11F' }} />
                                  {alignment}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(createPageUrl('Opportunities'))}
                            className="gap-2"
                            style={{ background: '#D8A11F', color: '#fff' }}
                          >
                            View Opportunity
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Partner Matches */}
                {matchData.partner_matches?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#000' }}>
                      <Users className="w-6 h-6" style={{ color: '#D8A11F' }} />
                      Top Partner Matches
                    </h2>
                    <div className="space-y-4">
                      {matchData.partner_matches.map((match, index) => (
                        <motion.div
                          key={match.partner_email}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          className="p-6 rounded-2xl"
                          style={{ background: '#fff', border: '2px solid #000' }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold" style={{ color: '#000' }}>
                                  Partner #{index + 1}
                                </h3>
                                <div
                                  className="px-3 py-1 rounded-full text-sm font-bold"
                                  style={{
                                    background: match.confidence_score >= 0.8 ? '#22C55E' : match.confidence_score >= 0.6 ? '#D8A11F' : '#3B82F6',
                                    color: '#fff'
                                  }}
                                >
                                  {Math.round(match.confidence_score * 100)}% Compatibility
                                </div>
                              </div>
                              <p className="text-lg font-semibold mb-2" style={{ color: '#666' }}>
                                {match.reasoning}
                              </p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-sm font-bold mb-2" style={{ color: '#000' }}>
                              Synergy Points:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {match.synergy_points?.map((point, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 rounded-lg text-sm"
                                  style={{ background: 'rgba(216, 161, 31, 0.1)', color: '#000', border: '1px solid #D8A11F' }}
                                >
                                  <CheckCircle className="w-3 h-3 inline mr-1" style={{ color: '#D8A11F' }} />
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(createPageUrl('Recommendations'))}
                            className="gap-2"
                            style={{ background: '#D8A11F', color: '#fff' }}
                          >
                            View Profile
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}