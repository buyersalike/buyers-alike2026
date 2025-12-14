import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PartnerSearchSection from "@/components/landing/PartnerSearchSection";
import AboutSection from "@/components/landing/AboutSection";
import JourneySection from "@/components/landing/JourneySection";
import PricingSection from "@/components/landing/PricingSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import SEO from "@/components/seo/SEO";
import { pageMetadata } from "@/components/seo/seoMetadata";

export default function Home() {
  const metadata = pageMetadata.Home;
  
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
      <SEO 
        title={metadata.title}
        description={metadata.description}
        keywords={metadata.keywords}
        canonicalUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />
      {/* Base gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A1628] via-[#1F3A8A]/20 to-[#1E3A5F] -z-10" />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />
      
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <PartnerSearchSection />
        <div id="about">
          <AboutSection />
        </div>
        <JourneySection />
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}