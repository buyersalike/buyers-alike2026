import React from "react";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight } from "lucide-react";

export default function CategoryCard({ category, postCount }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card glass-card-hover p-6 cursor-pointer group relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <Briefcase className="w-7 h-7" style={{ color: '#E5EDFF' }} />
        </div>
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <ArrowRight className="w-5 h-5" style={{ color: '#7C3AED' }} />
        </motion.div>
      </div>
      
      <h3 className="text-lg font-bold mb-2 relative z-10" style={{ color: '#E5EDFF' }}>
        {category.name}
      </h3>
      
      {category.description && (
        <p className="text-sm mb-4 line-clamp-2 relative z-10" style={{ color: '#B6C4E0' }}>
          {category.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 relative z-10" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color: '#7C3AED' }}>
            {postCount}
          </span>
          <span className="text-sm" style={{ color: '#7A8BA6' }}>
            {postCount === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}