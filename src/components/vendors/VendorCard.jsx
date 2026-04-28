import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Store, Star, ExternalLink, Award, Briefcase } from "lucide-react";
import VendorDetailDialog from "./VendorDetailDialog";

export default function VendorCard({ vendor, index, featured = false }) {
  const [showDetail, setShowDetail] = useState(false);

  if (featured) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => setShowDetail(true)}
          className="rounded-2xl cursor-pointer relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            border: '1.5px solid #D8A11F',
            boxShadow: '0 0 20px rgba(216, 161, 31, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Card content */}
          <div className="p-6 pb-4 flex-1">
           {/* Logo or Gold Star */}
           <div className="mb-5">
             {vendor.logo_url ? (
               <img src={vendor.logo_url} alt={vendor.name} className="w-14 h-14 rounded-xl object-cover" style={{ border: '1.5px solid rgba(216, 161, 31, 0.4)' }} />
             ) : (
               <Star className="w-10 h-10" style={{ color: '#D8A11F' }} fill="#D8A11F" />
             )}
           </div>

            {/* Vendor Name */}
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#FFFFFF' }}>
              {vendor.name}
            </h3>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md" style={{ background: '#D8A11F' }}>
                <Star className="w-3 h-3" style={{ color: '#fff' }} fill="#fff" />
                <span className="text-xs font-bold" style={{ color: '#fff' }}>FEATURED</span>
              </div>
              <div className="px-3 py-1 rounded-md text-xs font-medium" style={{ border: '1px solid rgba(216, 161, 31, 0.5)', color: '#E5E7EB', background: 'rgba(216, 161, 31, 0.1)' }}>
                {vendor.category}
              </div>
            </div>

            {/* Tagline */}
            {vendor.tagline && (
              <p className="text-sm italic mb-3 line-clamp-2" style={{ color: '#D8A11F' }}>
                "{vendor.tagline}"
              </p>
            )}

            {/* Stats Row */}
            <div className="flex items-center flex-wrap gap-4 mb-3 text-xs" style={{ color: '#CBD5E1' }}>
              {vendor.years_experience && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" style={{ color: '#D8A11F' }} />
                  <span>{vendor.years_experience}+ years</span>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D8A11F' }} />
                  <span>{vendor.address}</span>
                </div>
              )}
            </div>

            {/* Specialties */}
            {vendor.specialties && vendor.specialties.length > 0 && (
              <div className="space-y-1 mb-2">
                {vendor.specialties.slice(0, 3).map((specialty, idx) => (
                  <p key={idx} className="text-xs" style={{ color: '#94A3B8' }}>
                    {specialty}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Bottom CTA Bar */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(216, 161, 31, 0.25)' }}>
            <p className="text-sm font-semibold text-center" style={{ color: '#D8A11F' }}>
              Learn More
            </p>
          </div>
        </motion.div>

        <VendorDetailDialog vendor={vendor} open={showDetail} onOpenChange={setShowDetail} />
      </>
    );
  }

  // Non-featured card (original style)
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => setShowDetail(true)}
        className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
        style={{
          background: '#fff',
          border: '1px solid #000',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-4">
          {vendor.logo_url ? (
            <img src={vendor.logo_url} alt={vendor.name} className="w-20 h-20 rounded-xl object-cover" style={{ border: '1px solid #000' }} />
          ) : (
            <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center" style={{ 
              background: '#D8A11F', 
              border: '1px solid #000',
            }}>
              <Store className="w-10 h-10" style={{ color: '#fff' }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>
            {vendor.name}
          </h3>

          <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: '#D8A11F', color: '#fff' }}>
            {vendor.category}
          </div>

          {vendor.tagline && (
            <p className="text-sm font-medium mb-3 line-clamp-2" style={{ color: '#000' }}>
              "{vendor.tagline}"
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mb-3 text-xs" style={{ color: '#666' }}>
            {vendor.years_experience && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span>{vendor.years_experience}+ years</span>
              </div>
            )}
            {vendor.certifications && vendor.certifications.length > 0 && (
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>{vendor.certifications.length} certs</span>
              </div>
            )}
          </div>

          {vendor.specialties && vendor.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {vendor.specialties.slice(0, 3).map((specialty, idx) => (
                <span key={idx} className="px-2 py-1 text-xs rounded-full" style={{ background: '#F3F4F6', color: '#666' }}>
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#666' }} />
            <p className="text-sm" style={{ color: '#666' }}>
              {vendor.address}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-sm font-medium" style={{ color: '#D8A11F' }}>
            <span>Learn More</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      <VendorDetailDialog vendor={vendor} open={showDetail} onOpenChange={setShowDetail} />
    </>
  );
}