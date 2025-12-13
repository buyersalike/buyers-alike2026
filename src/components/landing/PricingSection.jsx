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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Choose the plan that fits your networking needs
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
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`h-full backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] ${
                plan.popular 
                  ? "bg-white/10 border-purple-500/50 shadow-2xl shadow-purple-500/10" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-white/50 text-sm mb-4">{plan.description}</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-white/50">{plan.period}</span>}
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-white/70 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className={`w-full py-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}