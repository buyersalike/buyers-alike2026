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
    }, 8000);
    return () => clearInterval(interval);
  }, [ads, delay]);

  if (!ads || ads.length === 0) return null;
  const currentAd = ads[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000, duration: 0.6 }}
      className="relative h-[400px] rounded-2xl overflow-hidden glass-light group"
    >
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full"
      >
        <img src={currentAd.flyer_url} alt={currentAd.business_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold mb-2 text-white">{currentAd.business_name}</h3>
          <motion.a
            href={currentAd.source_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#D8A11F' }}
            onClick={(e) => { if (!currentAd.source_url) e.preventDefault(); }}
          >
            <span>Learn More</span>
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </div>
        <div className="absolute top-4 right-4 flex gap-1">
          {ads.slice(0, 10).map((_, idx) => (
            <div key={idx} className="w-1 h-1 rounded-full transition-all"
              style={{ background: idx === currentIndex ? '#D8A11F' : 'rgba(255, 255, 255, 0.3)' }} />
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
        const allAds = await base44.entities.AdvertiseApplication.filter({ status: "approved" });
        const now = new Date();
        const activeAds = allAds.filter(ad => !ad.expiry_date || new Date(ad.expiry_date) > now);
        setAds(activeAds);
      } catch (error) {
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedAds();
  }, []);

  const column1 = ads.filter(ad => ad.landing_column === 1).slice(0, 10);
  const column2 = ads.filter(ad => ad.landing_column === 2).slice(0, 10);
  const column3 = ads.filter(ad => ad.landing_column === 3).slice(0, 10);
  const unassignedAds = ads.filter(ad => !ad.landing_column || ![1, 2, 3].includes(ad.landing_column));
  unassignedAds.forEach((ad, idx) => {
    const targetColumn = (idx % 3) + 1;
    if (targetColumn === 1 && column1.length < 10) column1.push(ad);
    else if (targetColumn === 2 && column2.length < 10) column2.push(ad);
    else if (targetColumn === 3 && column3.length < 10) column3.push(ad);
  });

  if (loading) {
    return (
      <section className="relative py-24 px-4" style={{ background: '#EEEDF2' }}>
        <div className="max-w-7xl mx-auto text-center" style={{ color: '#4a4a6a' }}>
          <p>Loading our trusted partners...</p>
        </div>
      </section>
    );
  }

  const hasAds = ads.length > 0;

  return (
    <section className="relative py-24 px-4" style={{ background: '#EEEDF2' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D8A11F]/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1a1a2e' }}>
            Our Trusted Partners
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: '#4a4a6a' }}>
            Discover businesses and opportunities from our verified vendor community
          </p>
        </motion.div>

        {hasAds ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {column1.length > 0 && <AdSliderColumn ads={column1} delay={0} />}
            {column2.length > 0 && <AdSliderColumn ads={column2} delay={0} />}
            {column3.length > 0 && <AdSliderColumn ads={column3} delay={0} />}
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: '#4a4a6a' }}>No active advertisements at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}