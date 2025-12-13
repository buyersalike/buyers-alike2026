import React from "react";
import { motion } from "framer-motion";
import { Quote, Star, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    quote: "BuyersAlike connected me with the perfect acquisition partner. Within 3 months, we closed a $2M deal that transformed my business.",
    author: "David Park",
    role: "CEO, TechStart Inc.",
    rating: 5,
  },
  {
    quote: "The quality of connections here is unmatched. Every conversation feels purposeful and leads to real opportunities.",
    author: "Amanda Chen",
    role: "Angel Investor",
    rating: 5,
  },
];

const stats = [
  { value: "$500M+", label: "Deal Volume" },
  { value: "95%", label: "Match Rate" },
  { value: "48hrs", label: "Avg. Response" },
];

export default function AboutSection() {
  return (
    <section className="relative py-24 px-4">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            About{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              BuyersAlike
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            We're on a mission to revolutionize how professionals find and connect with business partners
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Info card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                BuyersAlike was founded with a simple vision: make it easier for professionals 
                to find like-minded partners for business ventures. Whether you're looking for 
                acquisitions, joint ventures, or strategic partnerships, we provide the platform 
                and tools to make meaningful connections.
              </p>
              
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
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Testimonials */}
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <Quote className="w-10 h-10 text-purple-400/50 mb-4" />
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{testimonial.author}</p>
                      <p className="text-white/50 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array(testimonial.rating).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}