import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Rocket, ArrowRight } from "lucide-react";

export default function WelcomeStep({ onNext, currentUser }) {
  const [name, setName] = useState(currentUser?.full_name || "");
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && title.trim()) {
      // full_name is passed for display purposes in later steps,
      // but it's a read-only built-in and won't be sent to updateMe
      onNext({ full_name: name, title });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl"
    >
      <div className="p-8 md:p-12 rounded-3xl text-center" style={{ background: '#fff', border: '2px solid #000' }}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ background: 'linear-gradient(135deg, #D8A11F 0%, #F59E0B 100%)' }}
        >
          <Rocket className="w-10 h-10" style={{ color: '#fff' }} />
        </motion.div>

        {/* Welcome Message */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: '#000' }}
        >
          Welcome to BuyersAlike! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg mb-8"
          style={{ color: '#666' }}
        >
          Let's get you set up in just 60 seconds! We'll help you find the perfect business partners.
        </motion.p>

        {/* Quick Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="text-left">
            <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
              What should we call you? ✨
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="text-lg"
              style={{ background: '#fff', border: '2px solid #000', color: '#000' }}
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium mb-2" style={{ color: '#000' }}>
              What do you do? 💼
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Real Estate Investor, Entrepreneur"
              className="text-lg"
              style={{ background: '#fff', border: '2px solid #000', color: '#000' }}
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg py-6 rounded-xl gap-2 hover:scale-105 transition-transform"
            style={{ background: '#D8A11F', color: '#fff' }}
          >
            Let's Go!
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.form>

        {/* Trust Indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm mt-6 flex items-center justify-center gap-2"
          style={{ color: '#666' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: '#D8A11F' }} />
          Takes less than 60 seconds
        </motion.p>
      </div>
    </motion.div>
  );
}