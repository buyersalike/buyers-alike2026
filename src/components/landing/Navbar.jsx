import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Handshake, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [lastScrollY, setLastScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      
      // Smart hide/show navbar
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3 }}
        style={scrolled ? {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        } : {}}
        className="fixed top-4 left-4 right-4 z-50 rounded-2xl transition-all duration-500 mx-auto max-w-7xl"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo with glow */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center relative" 
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.4)',
                      '0 0 30px rgba(59, 130, 246, 0.6)',
                      '0 0 20px rgba(59, 130, 246, 0.4)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl"
                />
                <Handshake className="w-6 h-6 relative z-10" style={{ color: '#E5EDFF' }} />
              </motion.div>
              <span className="text-xl font-bold" style={{ color: '#E5EDFF' }}>BuyersAlike</span>
            </motion.div>

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

            {/* Enhanced CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="hover:bg-white/10 rounded-xl px-5" style={{ color: '#B6C4E0' }}>
                  Sign In
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-xl px-6 py-5 font-semibold shadow-lg relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}>
                  <motion.div
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <span className="relative z-10">Get Started Free</span>
                </Button>
              </motion.div>
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