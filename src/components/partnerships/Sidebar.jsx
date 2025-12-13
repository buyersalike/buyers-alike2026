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
  Sparkles,
  Store,
  Newspaper
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

const mainMenuItems = [
  { icon: Sparkles, label: "Recommendations", href: "Recommendations" },
  { icon: Briefcase, label: "Opportunities", href: "Opportunities" },
  { icon: Handshake, label: "Partnerships", href: "Partnerships" },
  { icon: Store, label: "Vendors", href: "Vendors" },
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
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 h-screen sticky top-0 p-6 overflow-y-auto" style={{ 
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(10px) saturate(180%)',
      WebkitBackdropFilter: 'blur(10px) saturate(180%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)' }}>
          <Building2 className="w-5 h-5" style={{ color: '#E5EDFF' }} />
        </div>
        <span className="text-xl font-bold" style={{ color: '#E5EDFF' }}>BuyersAlike</span>
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
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#7A8BA6' }}>Main Menu</p>
        {mainMenuItems.map((item) => {
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

      {/* Secondary Menu Items */}
      <div className="space-y-2 mb-8">
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#7A8BA6' }}>More</p>
        {menuItems.map((item) => {
          const MenuItem = item.href ? Link : 'button';
          const isActive = item.href && currentPath.includes(item.href);

          return (
            <MenuItem
              key={item.label}
              {...(item.href ? { to: createPageUrl(item.href) } : {})}
            >
              <motion.div
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
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
                {item.count && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    {item.count}
                  </span>
                )}
              </motion.div>
            </MenuItem>
          );
        })}
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#7A8BA6' }}>Categories</p>
        {categories.map((category) => (
          <motion.button
            key={category.label}
            whileHover={{ x: 4 }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-white/5"
            style={{ color: '#B6C4E0' }}
          >
            <div className="flex items-center gap-3">
              <category.icon className="w-4 h-4" />
              <span className="text-sm">{category.label}</span>
            </div>
            <span className="text-xs" style={{ color: '#7A8BA6' }}>{category.count}</span>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}