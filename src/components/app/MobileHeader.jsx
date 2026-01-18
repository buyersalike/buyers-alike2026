import React, { useState, useEffect } from "react";
import { Menu, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import NotificationBell from "@/components/notifications/NotificationBell";
import MobileSidebar from "@/components/partnerships/MobileSidebar";

export default function MobileHeader() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  return (
    <>
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ 
          background: '#192234',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="touch-target flex items-center justify-center"
          style={{ color: '#E5EDFF' }}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693d02907efe4593497f9496/10dad5458_ChatGPTImageJan11202606_15_53PM.png" 
            alt="BuyersAlike"
            className="h-8 w-auto"
          />
        </div>

        {currentUser && <NotificationBell currentUser={currentUser} />}
      </header>

      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentUser={currentUser}
      />
    </>
  );
}