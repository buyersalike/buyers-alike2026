import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import InterestCards from "@/components/onboarding/InterestCards";
import ProfileChat from "@/components/onboarding/ProfileChat";
import SuccessStep from "@/components/onboarding/SuccessStep";
import { Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    full_name: "",
    title: "",
    bio: "",
    location: "",
    investment_range: "",
    partnership_goals: "",
    interests: [],
  });
  // Keep a ref that's always in sync — SuccessStep reads from this
  const userDataRef = React.useRef(userData);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setCurrentUser(user);
        // Pre-fill name from existing user data
        setUserData(prev => ({
          ...prev,
          full_name: user.full_name || "",
        }));
      })
      .catch(() => base44.auth.redirectToLogin());
  }, []);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = (data) => {
    const updated = { ...userDataRef.current, ...data };
    userDataRef.current = updated;
    setUserData(updated);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F1F5' }}>
        <p style={{ color: '#000' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F2F1F5' }}>
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10"
          style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)' }}
        />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-2" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #D8A11F 0%, #F59E0B 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Top Bar */}
      <div className="fixed top-4 left-0 right-0 z-40 flex items-center justify-between px-6">
        {/* Back Button — hidden on step 1 and success step */}
        <div className="w-28">
          {currentStep > 1 && currentStep < TOTAL_STEPS && (
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full shadow"
              style={{ background: '#fff', border: '2px solid #000', color: '#000' }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        {/* Step Counter */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-5 py-2 rounded-full shadow-lg flex items-center gap-2"
          style={{ background: '#fff', border: '2px solid #000' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#D8A11F' }} />
          <span className="font-bold text-sm" style={{ color: '#000' }}>
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </motion.div>

        <div className="w-28" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <WelcomeStep key="welcome" onNext={handleNext} currentUser={currentUser} />
          )}
          {currentStep === 2 && (
            <InterestCards key="interests" onNext={handleNext} />
          )}
          {currentStep === 3 && (
            <ProfileChat key="profile" onNext={handleNext} userData={userData} />
          )}
          {currentStep === 4 && (
            <SuccessStep key="success" userData={userData} currentUser={currentUser} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}