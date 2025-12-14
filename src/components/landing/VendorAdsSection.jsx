import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ExternalLink } from "lucide-react";

const AdSliderColumn = ({ ads, delay = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!ads || ads.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 3000 + delay); // Different timing per column for visual interest

    return () => clearInterval(interval);
  }, [ads, delay]);

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000 }}
      className="relative h-[400px] rounded-2xl overflow-hidden glass-card group"
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full"
      >
        <img
          src={currentAd.flyer_url}
          alt={currentAd.business_name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
            {currentAd.business_name}
          </h3>
          
          {/* CTA Link */}
          <motion.a
            href={currentAd.source_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white font-medium"
            onClick={(e) => {
              if (!currentAd.source_url) {
                e.preventDefault();
              }
            }}
          >
            <span>Learn More</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>

        {/* Progress indicator (subtle) */}
        <div className="absolute top-4 right-4 flex gap-1">
          {ads.slice(0, 10).map((_, idx) => (
            <div
              key={idx}
              className="w-1 h-1 rounded-full transition-all"
              style={{
                background: idx === currentIndex ? '#3B82F6' : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function VendorAdsSection() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedAds = async () => {
      try {
        // Fetch approved ads that haven't expired
        const allAds = await base44.entities.AdvertiseApplication.filter({
          status: "approved"
        });
        
        // Filter by expiry date (not expired)
        const now = new Date();
        const activeAds = allAds.filter(ad => {
          if (!ad.expiry_date) return true;
          return new Date(ad.expiry_date) > now;
        });

        console.log("Active ads:", activeAds);
        setAds(activeAds);
      } catch (error) {
        console.error("Error fetching ads:", error);
        setAds([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedAds();
  }, []);

  // Split ads into 3 columns (up to 10 ads per column)
  const column1 = ads.slice(0, 10);
  const column2 = ads.slice(10, 20);
  const column3 = ads.slice(20, 30);

  if (loading) {
    return (
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto text-center" style={{ color: '#B6C4E0' }}>
          <p>Loading our trusted partners...</p>
        </div>
      </section>
    );
  }

  // Always show section with placeholder if no ads
  const hasAds = ads.length > 0;

  return (
    <section className="relative py-24 px-4">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F3A8A]/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#E5EDFF' }}>
            Our Trusted Partners
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#B6C4E0' }}>
            Discover businesses and opportunities from our verified vendor community
          </p>
        </motion.div>

        {/* 3-Column Slider Grid */}
        {hasAds ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {column1.length > 0 && <AdSliderColumn ads={column1} delay={0} />}
            {column2.length > 0 && <AdSliderColumn ads={column2} delay={500} />}
            {column3.length > 0 && <AdSliderColumn ads={column3} delay={1000} />}
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: '#B6C4E0' }}>No active advertisements at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}