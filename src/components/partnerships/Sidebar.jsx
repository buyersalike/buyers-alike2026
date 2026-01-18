import React from "react";
import { motion } from "framer-motion";
import { 
  LayoutGrid, 
  Bookmark, 
  MessageSquare, 
  Settings,
  TrendingUp,
  Users,
  Building2,
  Search,
  Briefcase,
  Handshake,
  Store,
  Newspaper,
  User,
  Shield,
  LogOut,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import NotificationBell from "@/components/notifications/NotificationBell";
import { canAccessAdmin, hasPermission } from "@/components/utils/permissions";

const mainMenuItems = [
  { icon: Handshake, label: "Partnerships", href: "Partnerships" },
  { icon: Briefcase, label: "Opportunities", href: "Opportunities" },
  { icon: TrendingUp, label: "Recommendations", href: "Recommendations" },
  { icon: Store, label: "Vendors", href: "Vendors" },
  { icon: LayoutGrid, label: "Ad Campaigns", href: "AdCampaigns" },
  { icon: Mail, label: "Messages", href: "Messages" },
  { icon: MessageSquare, label: "Forum", href: "Forum" },
  { icon: Newspaper, label: "News", href: "News" },
];

const menuItems = [
  { icon: Bookmark, label: "Saved", count: 12, href: null },
  { icon: MessageSquare, label: "Messages", count: 5, href: "Messages" },
  { icon: TrendingUp, label: "Trending", href: null },
  { icon: Users, label: "My Network", href: null },
];

const categories = [
  { icon: Building2, label: "Acquisitions", count: 24 },
  { icon: Users, label: "Joint Ventures", count: 18 },
  { icon: TrendingUp, label: "Investments", count: 32 },
  { icon: Settings, label: "Strategic", count: 15 },
];

export default function Sidebar() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const location = useLocation();
  const currentPath = location.pathname;

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  return (
    <aside className="hidden lg:flex w-64 h-screen sticky top-0 p-6 overflow-y-auto flex-col" style={{ 
      background: '#192234',
      backdropFilter: 'blur(10px) saturate(180%)',
      WebkitBackdropFilter: 'blur(10px) saturate(180%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <div className="flex-1">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693d02907efe4593497f9496/10dad5458_ChatGPTImageJan11202606_15_53PM.png" 
              alt="BuyersAlike"
              className="h-10 w-auto"
            />
          </div>
          {currentUser && <NotificationBell currentUser={currentUser} />}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7A8BA6' }} />
          <Input
            placeholder="Search..."
            className="w-full pl-10 glass-input rounded-xl focus:border-[#3B82F6]/50"
            style={{ color: '#E5EDFF' }}
          />
        </div>

        {/* Main Menu Items */}
        <div className="space-y-2 mb-8">
          {mainMenuItems.map((item) => {
            // Check permissions for special menu items
            if (item.label === "Ad Campaigns" && currentUser && !hasPermission(currentUser.role, 'canManageAdvertisements')) {
              return null;
            }

            const isActive = currentPath.includes(item.href);
            return (
              <Link key={item.label} to={createPageUrl(item.href)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
                  style={isActive ? {
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.2) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#E5EDFF'
                  } : {
                    color: '#B6C4E0'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

      </div>

      {/* Bottom Menu */}
      <div className="space-y-2 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Link to={createPageUrl('Profile')}>
          <motion.div
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer"
            style={currentPath.includes('Profile') ? {
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.2) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#E5EDFF'
            } : {
              color: '#B6C4E0'
            }}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </motion.div>
        </Link>

        <Link to={createPageUrl('Settings')}>
          <motion.button
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={currentPath.includes('Settings') ? {
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.2) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#E5EDFF'
            } : {
              color: '#B6C4E0'
            }}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </motion.button>
        </Link>

        {currentUser && canAccessAdmin(currentUser.role) && (
          <Link to={createPageUrl('Admin')}>
            <motion.button
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              style={currentPath.includes('Admin') ? {
                background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444'
              } : {
                color: '#EF4444'
              }}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">Admin</span>
            </motion.button>
          </Link>
        )}

        <motion.button
          onClick={() => base44.auth.logout()}
          whileHover={{ x: 4 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          style={{ color: '#EF4444' }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
}