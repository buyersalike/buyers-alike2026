import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Handshake, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Partnerships", href: "/Partnerships" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={scrolled ? {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px) saturate(180%)',
          WebkitBackdropFilter: 'blur(10px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        } : {}}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
                <Handshake className="w-5 h-5" style={{ color: '#E5EDFF' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: '#E5EDFF' }}>BuyersAlike</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                link.href.startsWith("#") ? (
                  <a
                    key={link.name}
                    href={link.href}
                    className="transition-colors duration-300 text-sm font-medium hover:opacity-100"
                    style={{ color: '#B6C4E0' }}
                    onMouseEnter={(e) => e.target.style.color = '#E5EDFF'}
                    onMouseLeave={(e) => e.target.style.color = '#B6C4E0'}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={createPageUrl(link.href.replace("/", ""))}
                    className="transition-colors duration-300 text-sm font-medium hover:opacity-100"
                    style={{ color: '#B6C4E0' }}
                    onMouseEnter={(e) => e.target.style.color = '#E5EDFF'}
                    onMouseLeave={(e) => e.target.style.color = '#B6C4E0'}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="hover:bg-white/10" style={{ color: '#B6C4E0' }}>
                Sign In
              </Button>
              <Button className="rounded-xl px-6" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}>
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
              style={{ color: '#E5EDFF' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 backdrop-blur-xl" style={{ background: 'rgba(10, 22, 40, 0.95)' }} onClick={() => setMobileMenuOpen(false)} />
            <div className="relative pt-24 px-6">
              <div className="space-y-4">
                {navLinks.map((link) => (
                  link.href.startsWith("#") ? (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg font-medium py-3"
                      style={{ color: '#E5EDFF', borderBottom: '1px solid rgba(255, 255, 255, 0.18)' }}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={createPageUrl(link.href.replace("/", ""))}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg font-medium py-3"
                      style={{ color: '#E5EDFF', borderBottom: '1px solid rgba(255, 255, 255, 0.18)' }}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
                <div className="pt-4 space-y-3">
                  <Button variant="outline" className="w-full hover:bg-white/10" style={{ borderColor: 'rgba(255, 255, 255, 0.18)', color: '#E5EDFF' }}>
                    Sign In
                  </Button>
                  <Button className="w-full" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}