import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X,
  Briefcase,
  Handshake,
  Store,
  Mail,
  MessageSquare,
  Newspaper,
  LayoutGrid,
  TrendingUp,
  User,
  Settings,
  Shield,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { canAccessAdmin, hasPermission } from "@/components/utils/permissions";

const mainMenuItems = [
  { icon: Handshake, label: "Partnerships", href: "Partnerships" },
  { icon: Briefcase, label: "Opportunities", href: "Opportunities" },
  { icon: TrendingUp, label: "Recommendations", href: "Recommendations" },
  { icon: Store, label: "Vendors", href: "Vendors" },
  { icon: LayoutGrid, label: "Ad Campaigns", href: "AdCampaigns", permission: "canManageAdvertisements" },
  { icon: Mail, label: "Messages", href: "Messages" },
  { icon: MessageSquare, label: "Forum", href: "Forum" },
  { icon: Newspaper, label: "News", href: "News" },
];

export default function MobileSidebar({ isOpen, onClose, currentUser }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-[280px] z-50 lg:hidden overflow-y-auto"
            style={{ 
              background: '#192234',
              borderRight: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
                    <Briefcase className="w-5 h-5" style={{ color: '#E5EDFF' }} />
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#E5EDFF' }}>BuyersAlike</span>
                </div>
                <button onClick={onClose} className="touch-target flex items-center justify-center">
                  <X className="w-6 h-6" style={{ color: '#B6C4E0' }} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2 mb-8">
                {mainMenuItems.map((item) => {
                  if (item.permission && (!currentUser || !hasPermission(currentUser.role, item.permission))) {
                    return null;
                  }
                  if (item.adminOnly && (!currentUser || !canAccessAdmin(currentUser.role))) {
                    return null;
                  }
                  const isActive = currentPath.includes(item.href);
                  return (
                    <Link key={item.label} to={createPageUrl(item.href)} onClick={onClose}>
                      <div
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-target"
                        style={isActive ? {
                          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(31, 58, 138, 0.2) 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#E5EDFF'
                        } : {
                          color: '#B6C4E0'
                        }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Menu */}
              <div className="space-y-2 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Link to={createPageUrl('Profile')} onClick={onClose}>
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-target"
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
                  </div>
                </Link>

                <Link to={createPageUrl('Settings')} onClick={onClose}>
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-target"
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
                  </div>
                </Link>

                {currentUser && canAccessAdmin(currentUser.role) && (
                  <Link to={createPageUrl('Admin')} onClick={onClose}>
                    <div
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-target"
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
                    </div>
                  </Link>
                )}

                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all touch-target"
                  style={{ color: '#EF4444' }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}