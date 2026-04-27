import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const AdSliderColumn = ({ ads, delay = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!ads || ads.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [ads, delay]);

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  const goPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const goNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#D8A11F' }}
            onClick={() => {
              if (currentAd.website) {
                const url = currentAd.website.startsWith('http') ? currentAd.website : `https://${currentAd.website}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <span>Learn More</span>
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress indicator (subtle) */}
        <div className="absolute top-4 right-4 flex gap-1">
          {ads.slice(0, 10).map((_, idx) => (
            <div
              key={idx}
              className="w-2 h-2 rounded-full transition-all cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              style={{
                background: idx === currentIndex ? '#D8A11F' : 'rgba(255, 255, 255, 0.4)',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      {ads.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </motion.div>
  );
};

export default function VendorAdsSection() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedAds = async () => {
      try {
        // Use backend function so unauthenticated users on public landing page can see ads
        const response = await base44.functions.invoke("getPublicAds", {});
        const activeAds = response.data?.ads || [];
        setAds(activeAds);
      } catch (error) {
        console.error("Error fetching ads:", error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedAds();
  }, []);

  // Organize ads by column assignment
  const column1 = ads.filter(ad => ad.landing_column === 1).slice(0, 10);
  const column2 = ads.filter(ad => ad.landing_column === 2).slice(0, 10);
  const column3 = ads.filter(ad => ad.landing_column === 3).slice(0, 10);
  
  // Distribute unassigned ads evenly across columns
  const unassignedAds = ads.filter(ad => !ad.landing_column || ![1, 2, 3].includes(ad.landing_column));
  unassignedAds.forEach((ad, idx) => {
    const targetColumn = (idx % 3) + 1;
    if (targetColumn === 1 && column1.length < 10) column1.push(ad);
    else if (targetColumn === 2 && column2.length < 10) column2.push(ad);
    else if (targetColumn === 3 && column3.length < 10) column3.push(ad);
  });

  if (loading) {
    return (
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto text-center" style={{ color: '#333' }}>
          <p>Loading our trusted partners...</p>
        </div>
      </section>
    );
  }

  // Always show section with placeholder if no ads
  const hasAds = ads.length > 0;

  return (
    <section className="relative py-24 px-4" style={{ background: '#F2F1F5' }}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D8A11F]/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000' }}>
            Our Trusted Partners
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#333' }}>
            Discover businesses and opportunities from our verified vendor community
          </p>
        </motion.div>

        {/* 3-Column Slider Grid */}
        {hasAds ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {column1.length > 0 && <AdSliderColumn ads={column1} delay={0} />}
            {column2.length > 0 && <AdSliderColumn ads={column2} delay={0} />}
            {column3.length > 0 && <AdSliderColumn ads={column3} delay={0} />}
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: '#333' }}>No active advertisements at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}