import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";

export default function PartnerSearchSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glass card */}
          <div className="glass-card glass-card-hover rounded-3xl p-12 md:p-16 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.1) 50%, rgba(124, 58, 237, 0.2) 100%)' }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3B82F6]/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}
              >
                <Sparkles className="w-10 h-10" style={{ color: '#E5EDFF' }} />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#E5EDFF' }}>
                Find Your Business Partner
              </h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#B6C4E0' }}>
                Let our AI-powered matching system connect you with the perfect partners for your next venture
              </p>
              
              <Button className="px-8 py-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ background: '#E5EDFF', color: '#0B1F3B' }}>
                <Search className="w-5 h-5 mr-2" />
                Start Searching
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}