import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Users, Handshake, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const steps = [
  {
    icon: Search,
    title: "Find Opportunities",
    description: "Search through verified profiles and discover partners that match your business goals and criteria.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Connect",
    description: "Reach out and start conversations with potential partners through our secure messaging system.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Handshake,
    title: "Close Deals",
    description: "Negotiate, collaborate, and finalize partnerships with confidence using our deal room features.",
    gradient: "from-cyan-500 to-green-500",
  },
];

export default function JourneySection() {
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    base44.auth.redirectToLogin(window.location.origin + "/Partnerships");
  };

  return (
    <section className="relative py-24 px-4" style={{ background: '#F2F1F5' }}>
      {/* Background gradient */}
      <div className="absolute inset-0" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#000' }}>
            Your Partnership{" "}
            <span className="bg-gradient-to-r from-[#D8A11F] to-[#F59E0B] bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#333' }}>
            Three simple steps to finding your ideal business partner
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0" />
              )}
              
              <div className="relative backdrop-blur-xl bg-white/5 border border-black rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 h-full">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-6 mt-4`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#000' }}>{step.title}</h3>
                <p style={{ color: '#333' }}>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-black rounded-3xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: '#000' }}>Start Networking Today</h3>
                <p style={{ color: '#333' }}>Join thousands of professionals making deals happen</p>
              </div>
            </div>
            <Button 
              onClick={handleGetStarted}
              disabled={loading}
              className="bg-white text-gray-900 hover:bg-white/90 px-8 py-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}