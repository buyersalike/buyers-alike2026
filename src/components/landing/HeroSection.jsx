import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Building2, Handshake, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-[#7C3AED]/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-96 h-96 bg-[#3B82F6]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#1F3A8A]/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#E5EDFF' }}>
              Connect with{" "}
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#7C3AED] to-[#1F3A8A] bg-clip-text text-transparent">
                Like-Minded
              </span>{" "}
              Business Partners
            </h1>
            <p className="text-lg mb-8 max-w-xl" style={{ color: '#B6C4E0' }}>
              Join our exclusive platform for professionals, founders, and dealmakers. 
              Find partners for acquisitions, deals, JV's, and more.
            </p>

            {/* Search input - glassmorphism */}
            <div className="relative mb-8">
              <div className="glass-card glass-card-hover p-2 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#7A8BA6' }} />
                  <Input
                    placeholder="Enter your email to get started"
                    className="w-full pl-12 pr-4 py-4 border-0 focus-visible:ring-0 text-lg glass-input"
                    style={{ color: '#E5EDFF', background: 'transparent' }}
                  />
                </div>
                <Link to={createPageUrl("Partnerships")}>
                  <Button className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}>
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { icon: Users, value: "10K+", label: "Active Members" },
                { icon: Building2, value: "5K+", label: "Companies" },
                { icon: Handshake, value: "2K+", label: "Deals Made" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="glass-card w-12 h-12 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6" style={{ color: '#3B82F6' }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>{stat.value}</p>
                    <p className="text-sm" style={{ color: '#7A8BA6' }}>{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Glass card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="glass-card glass-card-hover p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
                    <Users className="w-7 h-7" style={{ color: '#E5EDFF' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: '#E5EDFF' }}>Partner Match</h3>
                    <p style={{ color: '#7A8BA6' }}>Find your perfect match</p>
                  </div>
                </div>

                {/* Sample partner cards */}
                {[
                  { name: "Sarah Chen", role: "Tech Investor", match: "98%" },
                  { name: "Michael Ross", role: "M&A Advisor", match: "95%" },
                  { name: "Emily Davis", role: "Startup Founder", match: "92%" },
                ].map((partner, index) => (
                  <motion.div
                    key={partner.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.15 }}
                    className="glass-card glass-card-hover p-4 mb-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)', color: '#E5EDFF' }}>
                          {partner.name[0]}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#E5EDFF' }}>{partner.name}</p>
                          <p className="text-sm" style={{ color: '#7A8BA6' }}>{partner.role}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                        <span className="text-sm font-medium" style={{ color: '#22C55E' }}>{partner.match}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 w-20 h-20 glass-card flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(31, 58, 138, 0.4) 100%)' }}
              >
                <Handshake className="w-10 h-10" style={{ color: '#E5EDFF' }} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}