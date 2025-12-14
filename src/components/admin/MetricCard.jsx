import React from "react";
import { motion } from "framer-motion";

export default function MetricCard({ icon: Icon, title, value, subtitle, color = '#3B82F6', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-center mb-4">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`,
              border: `2px solid ${color}30`
            }}
          >
            <Icon className="w-8 h-8" style={{ color }} />
          </motion.div>
        </div>
        
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#B6C4E0' }}>
          {title}
        </h3>
        
        <motion.p 
          className="text-5xl font-black mb-3"
          style={{ 
            color,
            textShadow: `0 0 20px ${color}40`
          }}
        >
          {value}
        </motion.p>
        
        <p className="text-xs font-medium" style={{ color: '#7A8BA6' }}>
          {subtitle}
        </p>
      </div>

      {/* Decorative corner accent */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 opacity-20"
        style={{
          background: `radial-gradient(circle at top right, ${color} 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}