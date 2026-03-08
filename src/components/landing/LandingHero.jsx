import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const words = ["partners", "investors", "co-founders", "dealmakers"];

export default function LandingHero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {}).finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center px-6 md:px-10 overflow-hidden bg-gray-950">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950" />

      {/* Abstract shapes — very subtle */}
      <div className="absolute top-20 right-[10%] w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute bottom-20 left-[10%] w-[300px] h-[300px] rounded-full bg-blue-500/8 blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Tagline */}
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-8">
            The Partnership Platform
          </p>

          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight text-white mb-8">
            Find like-minded<br />
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="inline-block"
                style={{ fontStyle: 'italic', color: '#B8860B' }}
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
            <br />
            that help you grow.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join the exclusive network where professionals, founders, and dealmakers
            connect for acquisitions, investments, and strategic partnerships.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {authReady && (
              user ? (
                <Link to={createPageUrl("Partnerships")}>
                  <Button className="rounded-full px-10 h-14 text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-black/20">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    onClick={() => base44.auth.redirectToLogin(window.location.origin + '/Onboarding')}
                    className="rounded-full px-10 h-14 text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-black/20"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <a href="#about" className="text-base font-medium text-gray-400 hover:text-white transition-colors">
                    Learn more ↓
                  </a>
                </>
              )
            )}
          </div>

          {/* Social proof */}
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500">
            <span><strong className="text-white text-2xl font-bold">10K+</strong><br />Active Members</span>
            <div className="w-px h-10 bg-gray-700" />
            <span><strong className="text-white text-2xl font-bold">$500M+</strong><br />Deal Volume</span>
            <div className="w-px h-10 bg-gray-700" />
            <span><strong className="text-white text-2xl font-bold">95%</strong><br />Match Rate</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}