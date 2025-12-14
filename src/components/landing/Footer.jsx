import React from "react";
import { motion } from "framer-motion";
import { Handshake, Heart } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "API"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "Help Center", "Community", "Contact"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "Licenses"],
};

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-8 px-4"
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(180deg, transparent 0%, rgba(10, 22, 40, 0.5) 100%)',
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Enhanced Brand */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-xl"
                >
                  <Handshake className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-2xl font-bold text-white">BuyersAlike</span>
              </div>
              <p className="text-white/60 mb-6 max-w-sm text-base leading-relaxed">
                Connecting like-minded professionals for business partnerships, acquisitions, and ventures. 
                Join 10,000+ dealmakers closing deals every day.
              </p>
              <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
                <span>Made with</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                </motion.div>
                <span>for dealmakers worldwide</span>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {["ISO Certified", "GDPR Compliant", "SOC 2 Type II"].map((badge) => (
                  <div
                    key={badge}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#B6C4E0',
                    }}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Links */}
          {Object.entries(footerLinks).map(([category, links], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h4 className="text-white font-bold text-lg mb-5">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 5 }}
                      className="text-white/60 hover:text-white transition-colors duration-300 text-base inline-block"
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <p className="text-white/50 text-sm font-medium">
            © 2024 BuyersAlike. All rights reserved. Empowering {" "}
            <motion.span
              animate={{ color: ['#B6C4E0', '#3B82F6', '#B6C4E0'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="font-bold"
            >
              10,000+
            </motion.span>
            {" "} dealmakers worldwide.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
              <motion.a
                key={link}
                href="#"
                whileHover={{ y: -2 }}
                className="text-white/50 hover:text-white text-sm font-medium transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}