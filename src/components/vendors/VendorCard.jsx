import React from "react";
import { motion } from "framer-motion";
import { MapPin, Store, Star } from "lucide-react";

export default function VendorCard({ vendor, index, featured = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer relative overflow-hidden"
      style={{
        background: featured ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : '#fff',
        border: featured ? '2px solid #D8A11F' : '1px solid #000',
        boxShadow: featured ? '0 8px 24px rgba(216, 161, 31, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}
    >
      {featured && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: '#D8A11F' }}>
            <Star className="w-3 h-3" style={{ color: '#fff' }} fill="#fff" />
            <span className="text-xs font-bold" style={{ color: '#fff' }}>FEATURED</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center" style={{ 
            background: featured ? '#D8A11F' : '#D8A11F', 
            border: featured ? '2px solid #000' : '1px solid #000',
            boxShadow: featured ? '0 4px 12px rgba(216, 161, 31, 0.4)' : 'none'
          }}>
            <Store className="w-8 h-8" style={{ color: '#fff' }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Name */}
          <h3 className="text-lg font-bold mb-2" style={{ color: '#000' }}>
            {vendor.name}
          </h3>

          {/* Category */}
          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: '#D8A11F', color: '#fff' }}>
            {vendor.category}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 mt-3">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#666' }} />
            <p className="text-sm" style={{ color: '#666' }}>
              {vendor.address}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}