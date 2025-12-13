import React from "react";
import Navbar from "@/components/landing/Navbar";

export default function Layout({ children, currentPageName }) {
  // Pages that need app layout (authenticated with sidebar)
  const appPages = ["Partnerships", "Opportunities", "Recommendations", "Vendors", "Messages", "Forum", "PostDetail", "News", "Profile", "Settings", "ActivityFeed"];
  const isAppPage = appPages.includes(currentPageName);

  // Landing page doesn't need any navbar (has its own)
  if (currentPageName === "Home") {
    return <>{children}</>;
  }

  // App pages have sidebar navigation built-in, just add background
  if (isAppPage) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
        {children}
      </div>
    );
  }

  // Other pages (if any) get landing navbar
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}