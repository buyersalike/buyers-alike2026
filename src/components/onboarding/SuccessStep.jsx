import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, ArrowRight, TrendingUp, Users, Briefcase } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import confetti from "canvas-confetti";

export default function SuccessStep({ userData, currentUser }) {
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState(null);
  // Prevent double-save in StrictMode
  const hasSaved = useRef(false);
  const navigate = useNavigate();

  // Capture userData in a ref so the save function always has the latest values
  // even if React batches the state update and renders SuccessStep before userData state settles
  const userDataSnapshot = useRef(userData);

  const { data: opportunities = [] } = useQuery({
    queryKey: ['matchedOpportunities', userData.interests],
    queryFn: async () => {
      const allOpps = await base44.entities.Opportunity.list();
      return allOpps
        .filter(opp =>
          userDataSnapshot.current.interests?.some(int =>
            opp.category?.toLowerCase().includes(int.toLowerCase()) ||
            opp.title?.toLowerCase().includes(int.toLowerCase())
          )
        )
        .slice(0, 3);
    },
  });

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const save = async () => {
      setSaving(true);
      setError(null);

      const data = userDataSnapshot.current;

      try {
        // Build update payload — skip undefined/empty so existing profile fields aren't wiped
        const profileUpdate = {};
        if (data.title) profileUpdate.title = data.title;
        if (data.bio) profileUpdate.bio = data.bio;
        if (data.location) profileUpdate.location = data.location;
        if (data.investment_range) profileUpdate.investment_range = data.investment_range;
        if (data.partnership_goals) profileUpdate.partnership_goals = data.partnership_goals;
        profileUpdate.onboarding_complete = true;

        await base44.auth.updateMe(profileUpdate);

        // Save interests — deduplicate against existing
        if (data.interests?.length > 0) {
          const existing = await base44.entities.Interest.filter({ user_email: currentUser.email });
          const existingNames = new Set(existing.map(i => i.interest_name.toLowerCase()));
          const newInterests = data.interests.filter(
            interest => !existingNames.has(interest.toLowerCase())
          );
          for (const interest of newInterests) {
            await base44.entities.Interest.create({
              user_email: currentUser.email,
              interest_name: interest,
              status: "approved",
            });
          }
        }

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setSaving(false);

        setTimeout(() => navigate(createPageUrl('Partnerships')), 2500);
      } catch (err) {
        console.error('Onboarding save error:', err);
        setError('Something went wrong saving your profile. Please try again.');
        setSaving(false);
        hasSaved.current = false; // allow retry
      }
    };

    save();
  }, []); // intentionally run once on mount

  const handleRetry = () => {
    hasSaved.current = false;
    setError(null);
    setSaving(true);
    // Re-trigger by resetting hasSaved and calling save manually
    const save = async () => {
      hasSaved.current = true;
      const data = userDataSnapshot.current;
      try {
        const profileUpdate = {};
        if (data.title) profileUpdate.title = data.title;
        if (data.bio) profileUpdate.bio = data.bio;
        if (data.location) profileUpdate.location = data.location;
        if (data.investment_range) profileUpdate.investment_range = data.investment_range;
        if (data.partnership_goals) profileUpdate.partnership_goals = data.partnership_goals;
        profileUpdate.onboarding_complete = true;
        await base44.auth.updateMe(profileUpdate);

        if (data.interests?.length > 0) {
          const existing = await base44.entities.Interest.filter({ user_email: currentUser.email });
          const existingNames = new Set(existing.map(i => i.interest_name.toLowerCase()));
          const newInterests = data.interests.filter(i => !existingNames.has(i.toLowerCase()));
          for (const interest of newInterests) {
            await base44.entities.Interest.create({
              user_email: currentUser.email,
              interest_name: interest,
              status: "approved",
            });
          }
        }

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setSaving(false);
        setTimeout(() => navigate(createPageUrl('Partnerships')), 2500);
      } catch (err) {
        setError('Something went wrong. Please try again.');
        setSaving(false);
        hasSaved.current = false;
      }
    };
    save();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-4xl"
    >
      <div className="p-8 md:p-12 rounded-3xl text-center" style={{ background: '#fff', border: '2px solid #000' }}>
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
          style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}
        >
          <Trophy className="w-12 h-12" style={{ color: '#fff' }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: '#000' }}
        >
          You're all set! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg mb-8"
          style={{ color: '#666' }}
        >
          Your profile is complete and we've found some opportunities that match your interests!
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl" style={{ background: '#f5f5f5', border: '1px solid #000' }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: '#D8A11F' }} />
            <div className="font-bold text-2xl" style={{ color: '#000' }}>
              {userData.interests?.length || 0}
            </div>
            <div className="text-sm" style={{ color: '#666' }}>Interests</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: '#f5f5f5', border: '1px solid #000' }}>
            <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: '#D8A11F' }} />
            <div className="font-bold text-2xl" style={{ color: '#000' }}>
              {opportunities.length}
            </div>
            <div className="text-sm" style={{ color: '#666' }}>Matches</div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: '#f5f5f5', border: '1px solid #000' }}>
            <Users className="w-8 h-8 mx-auto mb-2" style={{ color: '#D8A11F' }} />
            <div className="font-bold text-2xl" style={{ color: '#000' }}>100%</div>
            <div className="text-sm" style={{ color: '#666' }}>Complete</div>
          </div>
        </motion.div>

        {/* Matched Opportunities Preview */}
        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2" style={{ color: '#000' }}>
              <Sparkles className="w-5 h-5" style={{ color: '#D8A11F' }} />
              Opportunities Matched to You
            </h3>
            <div className="space-y-3">
              {opportunities.map((opp, index) => (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-4 rounded-xl text-left"
                  style={{ background: '#f5f5f5', border: '1px solid #000' }}
                >
                  <div className="font-bold" style={{ color: '#000' }}>{opp.title}</div>
                  <div className="text-sm" style={{ color: '#666' }}>{opp.description?.substring(0, 80)}...</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          {error ? (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
              <Button
                onClick={handleRetry}
                size="lg"
                className="px-8 py-6 text-lg rounded-xl gap-2"
                style={{ background: '#D8A11F', color: '#fff' }}
              >
                Retry
              </Button>
            </div>
          ) : saving ? (
            <div className="py-4">
              <div
                className="inline-block animate-spin rounded-full h-8 w-8 border-4"
                style={{ borderColor: '#D8A11F', borderTopColor: 'transparent' }}
              />
              <p className="mt-4" style={{ color: '#666' }}>Setting up your profile...</p>
            </div>
          ) : (
            <Button
              onClick={() => navigate(createPageUrl('Partnerships'))}
              size="lg"
              className="px-8 py-6 text-lg rounded-xl gap-2 hover:scale-105 transition-transform"
              style={{ background: '#D8A11F', color: '#fff' }}
            >
              Start Exploring
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}