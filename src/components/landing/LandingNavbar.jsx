import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const links = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {}).finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 shrink-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693d02907efe4593497f9496/10dad5458_ChatGPTImageJan11202606_15_53PM.png"
                alt="BuyersAlike"
                className="h-9 w-auto"
              />
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-10">
              {links.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  className={`text-[15px] font-medium transition-colors ${
                    scrolled ? "text-gray-500 hover:text-gray-900" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {authReady && (
                user ? (
                  <Link to={createPageUrl("Partnerships")}>
                    <Button className="rounded-full px-6 h-10 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => base44.auth.redirectToLogin()}
                      className={`text-[15px] font-medium transition-colors ${
                        scrolled ? "text-gray-500 hover:text-gray-900" : "text-gray-300 hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                    <Button
                      onClick={() => base44.auth.redirectToLogin(window.location.origin + '/Onboarding')}
                      className="rounded-full px-6 h-10 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Get Started
                    </Button>
                  </>
                )
              )}
            </div>

            {/* Mobile toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 ${scrolled ? "text-gray-700" : "text-white"}`}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="pt-24 px-8 space-y-6">
              {links.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-2xl font-semibold text-gray-900"
                >
                  {l.label}
                </a>
              ))}
              <div className="pt-6 space-y-3">
                {authReady && (
                  user ? (
                    <Link to={createPageUrl("Partnerships")} onClick={() => setMobileOpen(false)}>
                      <Button className="w-full rounded-full h-12 bg-gray-900 text-white font-semibold">Dashboard</Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full rounded-full h-12 font-semibold"
                        onClick={() => { setMobileOpen(false); base44.auth.redirectToLogin(); }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full rounded-full h-12 bg-gray-900 text-white font-semibold"
                        onClick={() => { setMobileOpen(false); base44.auth.redirectToLogin(window.location.origin + '/Onboarding'); }}
                      >
                        Get Started
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}