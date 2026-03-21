import React from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Award, TrendingUp, Users, Handshake, Trophy } from "lucide-react";

const values = [
  {
    icon: Users,
    title: "Community First",
    description: "Building genuine relationships that last",
    bgColor: "#E3F2FD",
    iconColor: "#2196F3",
  },
  {
    icon: Target,
    title: "Goal Oriented",
    description: "Focused on achieving real results",
    bgColor: "#E8F5E9",
    iconColor: "#4CAF50",
  },
  {
    icon: Handshake,
    title: "Trust & Integrity",
    description: "Verified profiles and secure connections",
    bgColor: "#FFF9E1",
    iconColor: "#F59E0B",
  },
  {
    icon: Trophy,
    title: "Success Driven",
    description: "Measuring impact through partnerships",
    bgColor: "#F3E5F5",
    iconColor: "#9C27B0",
  },
];

const stats = [
  { value: "$500M+", label: "Deal Volume" },
  { value: "95%", label: "Match Rate" },
  { value: "48hrs", label: "Avg. Response" },
];

export default function AboutSection() {
  return (
    <section className="relative py-24 px-4" style={{ background: '#192234' }}>
      {/* Background elements */}
      <div className="absolute inset-0">
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 backdrop-blur-xl px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.18)' }}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Award-Winning Platform</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            About{" "}
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-gradient-to-r from-[#D8A11F] via-[#F59E0B] to-[#D8A11F] bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 200%" }}
            >
              BuyersAlike
            </motion.span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize how professionals find and connect with business partners. 
            Trusted by Fortune 500 companies and emerging startups alike.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Info card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-full"
          >
            <div className="backdrop-blur-xl rounded-3xl p-8 lg:p-10 relative overflow-hidden h-full flex flex-col"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Animated gradient background */}
              <motion.div
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0 opacity-10 bg-gradient-to-br from-[#D8A11F] via-[#F59E0B] to-[#D8A11F]"
                style={{ backgroundSize: "200% 200%" }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D8A11F] to-[#F59E0B] flex items-center justify-center"
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white">Our Mission</h3>
                </div>
                <p className="text-white/80 leading-relaxed text-lg mb-6">
                  BuyersAlike was founded with a simple vision: make it easier for professionals 
                  to find like-minded partners for business ventures. Whether you're looking for 
                  acquisitions, joint ventures, or strategic partnerships, we provide the platform 
                  and tools to make meaningful connections that drive real results.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  "Verified professional network",
                  "AI-powered matching algorithm",
                  "Secure deal rooms for negotiations",
                  "Dedicated support team",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#D8A11F] flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/10">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center"
                  >
                    <motion.p 
                      className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#D8A11F] to-[#F59E0B] bg-clip-text text-transparent"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-sm font-medium text-white/60 mt-2">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Core Values Grid */}
          <div className="grid grid-cols-2 gap-6 h-full">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="rounded-3xl p-8 text-center"
                style={{
                  background: value.bgColor,
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                  style={{ background: value.iconColor + '20' }}
                >
                  <value.icon className="w-8 h-8" style={{ color: value.iconColor }} />
                </motion.div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#000' }}>
                  {value.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ color: '#333' }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}