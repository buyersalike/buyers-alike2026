import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Building2, Handshake, ArrowRight, Sparkles, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ConvergenceAnimation from "./ConvergenceAnimation";
import StatCard from "./StatCard";
import { base44 } from "@/api/base44Client";

export default function HeroSection() {
  const [activeUsers, setActiveUsers] = useState(9847);
  const [dealsToday, setDealsToday] = useState(23);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5));
      if (Math.random() > 0.7) setDealsToday(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 pb-10" style={{ background: '#192234' }}>
      {/* Animated background with CSS animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#7C3AED]/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-[#3B82F6]/25 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#1F3A8A]/20 rounded-full blur-3xl animate-float-fast" />
        
        {Array.from({ length: 8 }, (_, i) => i).map((i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/40 rounded-full blur-sm animate-pulse-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + i * 8}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Floating trust badges */}
      <div className="absolute top-32 left-10 hidden xl:block animate-fade-in-down" style={{ animationDelay: '1s' }}>
        <div className="glass-card px-4 py-2 flex items-center gap-2 rounded-full">
          <Award className="w-4 h-4" style={{ color: '#FACC15' }} />
          <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>Trusted by 500+ Companies</span>
        </div>
      </div>

      <div className="absolute top-40 right-12 hidden xl:block animate-fade-in-left" style={{ animationDelay: '1.2s' }}>
        <div className="glass-card px-4 py-2 flex items-center gap-2 rounded-full">
          <TrendingUp className="w-4 h-4" style={{ color: '#22C55E' }} />
          <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{dealsToday} deals closed today</span>
        </div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="animate-fade-in-right">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6 animate-fade-in-up">
              <Sparkles className="w-4 h-4" style={{ color: '#FACC15' }} />
              <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>
                {activeUsers.toLocaleString()}+ active users right now
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6" style={{ color: '#E5EDFF' }}>
              Connect with{" "}
              <span
                className="bg-gradient-to-r from-[#DBA11F] via-[#F59E0B] to-[#DBA11F] bg-clip-text text-transparent animate-gradient-shift"
                style={{ backgroundSize: "200% 200%" }}
              >
                Like-Minded
              </span>{" "}
              Business Partners
            </h1>
            <p className="text-xl mb-8 max-w-xl leading-relaxed" style={{ color: '#B6C4E0' }}>
              Join the #1 exclusive platform for professionals, founders, and dealmakers. 
              Find verified partners for acquisitions, investments, JVs, and strategic partnerships.
            </p>

            {/* Search input */}
            <div className="relative mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#DBA11F]/20 via-[#F59E0B]/20 to-[#DBA11F]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative glass-card glass-card-hover p-2 flex flex-col sm:flex-row gap-3 rounded-2xl" style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: '#7A8BA6' }} />
                    <Input
                      placeholder="Enter your email to get started..."
                      className="w-full pl-12 pr-4 py-6 border-0 focus-visible:ring-2 focus-visible:ring-[#DBA11F]/50 text-lg glass-input rounded-xl"
                      style={{ color: '#E5EDFF', background: 'rgba(255, 255, 255, 0.05)' }}
                      readOnly
                    />
                  </div>
                  {!isAuthChecking && (
                    currentUser ? (
                      <Link to={createPageUrl("Partnerships")}>
                        <Button className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-lg shadow-2xl hover:scale-105 transition-transform" style={{ background: '#D8A11F', color: '#fff' }}>
                          <span className="flex items-center">
                            Go to Dashboard
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </span>
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        onClick={() => base44.auth.redirectToLogin(window.location.origin + '/Onboarding')}
                        className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-lg shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform" 
                        style={{ background: '#D8A11F', color: '#fff' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        <span className="relative z-10 flex items-center">
                          Get Started Free
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </span>
                      </Button>
                    )
                  )}
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => i).map((i) => (
                    <svg key={i} className="w-4 h-4" fill="#FACC15" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm font-medium ml-2" style={{ color: '#B6C4E0' }}>
                    4.9/5 from 500+ reviews
                  </span>
                </div>
                <span className="text-sm" style={{ color: '#7A8BA6' }}>•</span>
                <span className="text-sm" style={{ color: '#B6C4E0' }}>No credit card required</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <StatCard icon={Users} value="10K+" label="Active Members" gradient="from-[#DBA11F] to-[#F59E0B]" delay={0.6} />
              <StatCard icon={Building2} value="5K+" label="Partners" gradient="from-[#F59E0B] to-[#DBA11F]" delay={0.7} />
              <StatCard icon={Handshake} value="2K+" label="Deals Closed" gradient="from-[#DBA11F] to-[#F59E0B]" delay={0.8} />
            </div>
          </div>

          {/* Right side - Convergence Animation */}
          <div className="hidden lg:block animate-fade-in-left">
            <div className="relative glass-card p-8 rounded-3xl" style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }}>
              <ConvergenceAnimation />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}