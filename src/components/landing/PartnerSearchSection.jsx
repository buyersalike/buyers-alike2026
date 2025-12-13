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
          <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-cyan-500/20 border border-white/20 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 mb-8 shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Find Your Business Partner
              </h2>
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                Let our AI-powered matching system connect you with the perfect partners for your next venture
              </p>
              
              <Button className="bg-white text-gray-900 hover:bg-white/90 px-8 py-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20">
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