import React from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Shield, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Zap,
  Globe,
  Lock
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Matching",
    description: "AI-powered algorithm matches you with the most compatible business partners based on your criteria.",
    gradient: "from-[#3B82F6] to-[#1F3A8A]",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Every member is verified to ensure you're connecting with legitimate professionals and founders.",
    gradient: "from-[#7C3AED] to-[#3B82F6]",
  },
  {
    icon: Users,
    title: "Professional Network",
    description: "Access an exclusive community of dealmakers, investors, and entrepreneurs worldwide.",
    gradient: "from-[#1F3A8A] to-[#0B1F3B]",
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description: "End-to-end encrypted communication to discuss deals and opportunities privately.",
    gradient: "from-[#3B82F6] to-[#7C3AED]",
  },
  {
    icon: BarChart3,
    title: "Deal Analytics",
    description: "Track your connections, conversations, and deal progress with detailed insights.",
    gradient: "from-[#FACC15] to-[#22C55E]",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with partners across continents and expand your business horizons internationally.",
    gradient: "from-[#7C3AED] to-[#1F3A8A]",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 px-4">
      {/* Enhanced background with depth */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F3A8A]/15 to-transparent" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#7C3AED]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-[#3B82F6]/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          {/* Premium badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-4 h-4" style={{ color: '#22C55E' }} />
            </motion.div>
            <span className="text-sm font-medium" style={{ color: '#E5EDFF' }}>
              Trusted by Fortune 500 Companies
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: '#E5EDFF' }}>
            Powerful Features for{" "}
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="bg-gradient-to-r from-[#3B82F6] via-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 200%" }}
            >
              Professional Networking
            </motion.span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#B6C4E0' }}>
            Everything you need to find, connect, and close deals with the right partners. 
            Built for serious dealmakers.
          </p>
        </motion.div>

        {/* Bento grid layout - Fortune 500 style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            // Make first card span 2 columns on large screens
            const isLarge = index === 0;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={`group ${isLarge ? 'lg:col-span-2' : ''}`}
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="h-full glass-card p-8 lg:p-10 rounded-3xl relative overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Animated gradient on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.1 }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} transition-opacity duration-500`}
                  />
                  
                  <div className="relative z-10">
                    {/* Icon with enhanced styling */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-2xl`}
                      style={{
                        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <feature.icon className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: '#fff' }} />
                    </motion.div>
                    
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4" style={{ color: '#E5EDFF' }}>
                      {feature.title}
                    </h3>
                    <p className="leading-relaxed text-base lg:text-lg" style={{ color: '#B6C4E0' }}>
                      {feature.description}
                    </p>

                    {/* Premium indicator */}
                    {index < 3 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(250, 204, 21, 0.1)',
                          border: '1px solid rgba(250, 204, 21, 0.3)',
                        }}
                      >
                        <Zap className="w-3 h-3" style={{ color: '#FACC15' }} />
                        <span className="text-xs font-bold" style={{ color: '#FACC15' }}>PREMIUM</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className={`w-full h-full bg-gradient-to-br ${feature.gradient} blur-2xl rounded-full`}
                    />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature highlight CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-lg font-medium mb-4" style={{ color: '#B6C4E0' }}>
            Join 10,000+ professionals already closing deals
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: "$500M+", label: "Total Deal Volume" },
              { value: "95%", label: "Success Rate" },
              { value: "48hrs", label: "Avg. Match Time" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm font-medium mt-1" style={{ color: '#7A8BA6' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}