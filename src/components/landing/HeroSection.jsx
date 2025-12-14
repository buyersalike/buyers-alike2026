import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Building2, Handshake, ArrowRight, Sparkles, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroSection() {
  const [activeUsers, setActiveUsers] = useState(9847);
  const [dealsToday, setDealsToday] = useState(23);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5));
      if (Math.random() > 0.7) setDealsToday(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Enhanced animated background with depth layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-96 h-96 bg-[#7C3AED]/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-[500px] h-[500px] bg-[#3B82F6]/25 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#1F3A8A]/20 rounded-full blur-3xl"
        />
        
        {/* Additional floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-cyan-400/40 rounded-full blur-sm"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + i * 8}%`,
            }}
          />
        ))}
      </div>

      {/* Floating trust badges */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-32 left-10 hidden xl:block"
      >
        <div className="glass-card px-4 py-2 flex items-center gap-2 rounded-full">
          <Award className="w-4 h-4" style={{ color: '#FACC15' }} />
          <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>Trusted by 500+ Companies</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute top-40 right-12 hidden xl:block"
      >
        <div className="glass-card px-4 py-2 flex items-center gap-2 rounded-full">
          <TrendingUp className="w-4 h-4" style={{ color: '#22C55E' }} />
          <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{dealsToday} deals closed today</span>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" style={{ color: '#FACC15' }} />
              <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>
                {activeUsers.toLocaleString()}+ active users right now
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6" style={{ color: '#E5EDFF' }}>
              Connect with{" "}
              <motion.span
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-[#3B82F6] via-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent"
                style={{ backgroundSize: "200% 200%" }}
              >
                Like-Minded
              </motion.span>{" "}
              Business Partners
            </h1>
            <p className="text-xl mb-8 max-w-xl leading-relaxed" style={{ color: '#B6C4E0' }}>
              Join the #1 exclusive platform for professionals, founders, and dealmakers. 
              Find verified partners for acquisitions, investments, JVs, and strategic partnerships.
            </p>

            {/* Enhanced search input with multi-layer glass effect */}
            <div className="relative mb-10">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/20 via-[#7C3AED]/20 to-[#3B82F6]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative glass-card glass-card-hover p-2 flex flex-col sm:flex-row gap-3 rounded-2xl" style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}>
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: '#7A8BA6' }} />
                    <Input
                      placeholder="Enter your email to get started..."
                      className="w-full pl-12 pr-4 py-6 border-0 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 text-lg glass-input rounded-xl"
                      style={{ color: '#E5EDFF', background: 'rgba(255, 255, 255, 0.05)' }}
                    />
                  </div>
                  <Link to={createPageUrl("Partnerships")}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full sm:w-auto px-8 py-6 rounded-xl font-bold text-lg shadow-2xl relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}>
                        <motion.div
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <span className="relative z-10 flex items-center">
                          Get Started Free
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
              
              {/* Trust indicators below search */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
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

            {/* Enhanced animated stats */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: Users, value: "10K+", label: "Active Members", gradient: "from-[#3B82F6] to-[#7C3AED]" },
                { icon: Building2, value: "5K+", label: "Fortune 500 Companies", gradient: "from-[#7C3AED] to-[#F59E0B]" },
                { icon: Handshake, value: "2K+", label: "Deals Closed", gradient: "from-[#22C55E] to-[#3B82F6]" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="flex items-center gap-4 glass-card glass-card-hover px-5 py-4 rounded-2xl"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-7 h-7" style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <motion.p 
                      className="text-3xl font-bold"
                      style={{ color: '#E5EDFF' }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-sm font-medium" style={{ color: '#B6C4E0' }}>{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Enhanced 3D glass card with live activity */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Main card with enhanced depth */}
              <div className="relative glass-card p-8 rounded-3xl" style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                {/* Animated gradient border */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 50%, #3B82F6 100%)',
                    padding: '2px',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    opacity: 0.3,
                  }}
                />

                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.3)',
                        '0 0 40px rgba(59, 130, 246, 0.5)',
                        '0 0 20px rgba(59, 130, 246, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center" 
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}
                  >
                    <Users className="w-8 h-8" style={{ color: '#E5EDFF' }} />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>Live Matches</h3>
                    <p className="text-sm" style={{ color: '#B6C4E0' }}>AI-powered partner discovery</p>
                  </div>
                </div>

                {/* Enhanced partner cards with stagger animation */}
                <div className="space-y-3 mb-4">
                  {[
                    { name: "Sarah Chen", role: "Tech Investor", match: "98%", location: "San Francisco", gradient: "from-[#3B82F6] to-[#7C3AED]" },
                    { name: "Michael Ross", role: "M&A Advisor", match: "95%", location: "New York", gradient: "from-[#7C3AED] to-[#F59E0B]" },
                    { name: "Emily Davis", role: "Startup Founder", match: "92%", location: "London", gradient: "from-[#22C55E] to-[#3B82F6]" },
                  ].map((partner, index) => (
                    <motion.div
                      key={partner.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.15 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      className="glass-card glass-card-hover p-4 cursor-pointer rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg bg-gradient-to-br ${partner.gradient}`} style={{ color: '#fff' }}>
                            {partner.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-base" style={{ color: '#E5EDFF' }}>{partner.name}</p>
                            <p className="text-xs" style={{ color: '#7A8BA6' }}>{partner.role} • {partner.location}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl" style={{ 
                          background: 'rgba(34, 197, 94, 0.15)', 
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)',
                        }}>
                          <span className="text-sm font-bold" style={{ color: '#22C55E' }}>{partner.match}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Live activity indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-[#22C55E]"
                  />
                  <span className="text-xs font-medium" style={{ color: '#B6C4E0' }}>
                    {Math.floor(Math.random() * 50) + 150} users online • {Math.floor(Math.random() * 10) + 5} new matches
                  </span>
                </motion.div>
              </div>

              {/* Floating elements with depth */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-8 -right-8 w-24 h-24 glass-card flex items-center justify-center rounded-3xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(124, 58, 237, 0.5) 100%)',
                  boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Handshake className="w-12 h-12" style={{ color: '#E5EDFF' }} />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -3, 0],
                }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 glass-card px-4 py-2 rounded-2xl"
                style={{ 
                  background: 'rgba(124, 58, 237, 0.4)',
                  boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: '#FACC15' }} />
                  <span className="text-sm font-bold" style={{ color: '#E5EDFF' }}>AI Matching</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}