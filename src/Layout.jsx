import React from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";
import MobileHeader from "@/components/app/MobileHeader";

export default function Layout({ children, currentPageName }) {
  // Pages that need app layout (authenticated with sidebar)
  const appPages = ["Partnerships", "PartnershipManagement", "Opportunities", "OpportunityDetail", "Recommendations", "Vendors", "Messages", "Forum", "PostDetail", "News", "Profile", "Settings", "ActivityFeed", "AdCampaigns", "Admin", "Connections"];
  const isAppPage = appPages.includes(currentPageName);

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Helmet>

      {/* Landing page doesn't need any navbar (has its own) */}
      {currentPageName === "Home" && <>{children}</>}

      {/* App pages have sidebar navigation built-in, just add background and mobile header */}
      {isAppPage && (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
          <MobileHeader />
          <div className="lg:pt-0 pt-[60px]">
            {children}
          </div>
        </div>
      )}

      {/* Other pages (if any) get landing navbar */}
      {!isAppPage && currentPageName !== "Home" && (
        <>
          <Navbar />
          {children}
        </>
      )}
    </HelmetProvider>
  );
}