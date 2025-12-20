import React from "react";
import { HelmetProvider } from "react-helmet-async";
import Navbar from "@/components/landing/Navbar";

export default function Layout({ children, currentPageName }) {
  // Pages that need app layout (authenticated with sidebar)
  const appPages = ["Partnerships", "Opportunities", "Recommendations", "Vendors", "Messages", "Forum", "PostDetail", "News", "Profile", "Settings", "ActivityFeed", "Events", "EventDetail", "AdCampaigns", "Admin", "Projects", "ProjectDetail", "Connections"];
  const isAppPage = appPages.includes(currentPageName);

  return (
    <HelmetProvider>
      {/* Landing page doesn't need any navbar (has its own) */}
      {currentPageName === "Home" && <>{children}</>}

      {/* App pages have sidebar navigation built-in, just add background */}
      {isAppPage && (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
          {children}
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