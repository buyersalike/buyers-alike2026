import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for exploring the platform",
    icon: Zap,
    gradient: "from-gray-500 to-gray-600",
    features: [
      "5 connections per month",
      "Basic profile",
      "Community access",
      "Email support",
    ],
    buttonText: "Get Started",
    buttonStyle: "border-white/20 bg-white/5 hover:bg-white/10 text-white",
  },
  {
    name: "Professional",
    price: "$29",
    period: "/month",
    description: "For active dealmakers",
    icon: Sparkles,
    gradient: "from-purple-500 to-cyan-500",
    popular: true,
    features: [
      "Unlimited connections",
      "Verified badge",
      "Advanced search filters",
      "Deal room access",
      "Priority support",
      "Analytics dashboard",
    ],
    buttonText: "Start Free Trial",
    buttonStyle: "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white",
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For teams and organizations",
    icon: Crown,
    gradient: "from-amber-500 to-orange-500",
    features: [
      "Everything in Professional",
      "Team collaboration",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "White-glove onboarding",
    ],
    buttonText: "Contact Sales",
    buttonStyle: "border-white/20 bg-white/5 hover:bg-white/10 text-white",
  },
];

export default function PricingSection() {
  return (
    <section className="relative py-24 px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 backdrop-blur-xl px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.18)' }}
          >
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">14-day free trial • No credit card required</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Simple, Transparent{" "}
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 200%" }}
            >
              Pricing
            </motion.span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your networking needs. Cancel anytime, no questions asked.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                        '0 0 30px rgba(168, 85, 247, 0.6)',
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold shadow-xl"
                  >
                    ⭐ Most Popular
                  </motion.div>
                </div>
              )}
              
              <motion.div 
                whileHover={{ y: -10, scale: 1.03 }}
                className={`h-full backdrop-blur-xl border rounded-3xl p-8 lg:p-10 transition-all duration-500 relative overflow-hidden ${
                  plan.popular 
                    ? "border-purple-500/50 shadow-2xl shadow-purple-500/20" 
                    : "border-white/10 hover:border-white/20"
                }`}
                style={{
                  background: plan.popular ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: plan.popular ? '0 20px 60px rgba(168, 85, 247, 0.3)' : '0 10px 40px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Animated gradient background */}
                {plan.popular && (
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute inset-0 opacity-10 bg-gradient-to-br from-purple-500 via-cyan-500 to-purple-500"
                    style={{ backgroundSize: "200% 200%" }}
                  />
                )}
                
                <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-2xl`}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm mb-6 font-medium">{plan.description}</p>
                
                <div className="flex items-baseline gap-2 mb-8">
                  <motion.span 
                    className="text-5xl font-bold text-white"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    {plan.price}
                  </motion.span>
                  {plan.period && <span className="text-white/50 text-lg font-medium">{plan.period}</span>}
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-white/80 text-base font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button className={`w-full py-6 rounded-xl font-bold text-base shadow-2xl relative overflow-hidden group ${plan.buttonStyle}`}>
                    {plan.popular && (
                      <motion.div
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    )}
                    <span className="relative z-10">{plan.buttonText}</span>
                  </Button>
                </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}