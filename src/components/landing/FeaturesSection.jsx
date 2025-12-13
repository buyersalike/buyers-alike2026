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
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Every member is verified to ensure you're connecting with legitimate professionals and founders.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Professional Network",
    description: "Access an exclusive community of dealmakers, investors, and entrepreneurs worldwide.",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description: "End-to-end encrypted communication to discuss deals and opportunities privately.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    title: "Deal Analytics",
    description: "Track your connections, conversations, and deal progress with detailed insights.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with partners across continents and expand your business horizons internationally.",
    gradient: "from-indigo-500 to-purple-500",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Professional Networking
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to find, connect, and close deals with the right partners
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <div className="h-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}