import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import Sidebar from "@/components/partnerships/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import GeneralSummary from "@/components/admin/GeneralSummary";
import OpportunitiesSummary from "@/components/admin/OpportunitiesSummary";
import ConnectionSummary from "@/components/admin/ConnectionSummary";
import InterestsSummary from "@/components/admin/InterestsSummary";
import UserGrowthChart from "@/components/admin/UserGrowthChart";
import OpportunityDistributionChart from "@/components/admin/OpportunityDistributionChart";
import ActivityChart from "@/components/admin/ActivityChart";
import InterestTrendsChart from "@/components/admin/InterestTrendsChart";

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setCurrentUser(user);
        setIsLoading(false);
      })
      .catch(() => {
        setCurrentUser(null);
        setIsLoading(false);
      });
  }, []);

  // Fetch all data
  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['allOpportunities'],
    queryFn: () => base44.entities.Opportunity.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['allConnections'],
    queryFn: () => base44.entities.Connection.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['allInterests'],
    queryFn: () => base44.entities.Interest.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['allGroups'],
    queryFn: () => base44.entities.GroupChat.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['allActivities'],
    queryFn: () => base44.entities.Activity.list(),
    enabled: currentUser?.role === 'admin',
  });

  // Calculate metrics
  const generalMetrics = {
    totalUsers: users.length,
    activePayingMembers: 0, // Placeholder - would need subscription system
    monthlyRevenue: 0, // Placeholder - would need subscription system
    totalPartnerships: connections.filter(c => c.status === 'connected').length,
    totalGroups: groups.length,
  };

  const opportunitiesMetrics = {
    total: opportunities.length,
    pending: opportunities.filter(o => o.status === 'pending').length,
    verified: opportunities.filter(o => o.status === 'verified').length,
    unverified: opportunities.filter(o => o.status === 'unverified').length,
    rejected: 0, // Add rejected status to entity if needed
    closed: 0, // Add closed status to entity if needed
  };

  const connectionMetrics = {
    total: connections.filter(c => c.status === 'connected').length,
    pending: connections.filter(c => c.status === 'pending').length,
    requested: connections.filter(c => c.status === 'pending').length,
  };

  const interestsMetrics = {
    total: interests.length,
    approved: interests.filter(i => i.status === 'approved').length,
    pending: interests.filter(i => i.status === 'pending').length,
    rejected: interests.filter(i => i.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-main">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#7A8BA6' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex min-h-screen bg-gradient-main">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
              Access Denied
            </h2>
            <p style={{ color: '#7A8BA6' }}>
              You need administrator privileges to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-main">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-8 mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)',
              backdropFilter: 'blur(10px) saturate(180%)',
              WebkitBackdropFilter: 'blur(10px) saturate(180%)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
            }}
          >
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{
              background: 'radial-gradient(circle, #EF4444 0%, transparent 70%)',
            }} />
            
            <div className="relative z-10 flex items-center gap-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)'
                }}
              >
                <Shield className="w-10 h-10" style={{ color: '#fff' }} />
              </motion.div>
              
              <div>
                <h1 className="text-4xl font-black mb-2" style={{ 
                  color: '#E5EDFF',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  Admin Dashboard
                </h1>
                <p className="text-base font-medium" style={{ color: '#B6C4E0' }}>
                  Monitor and manage platform metrics
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList 
              className="p-2 rounded-2xl mb-8"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              <TabsTrigger value="dashboard" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Users
              </TabsTrigger>
              <TabsTrigger value="partner" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Partner
              </TabsTrigger>
              <TabsTrigger value="opportunity" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Opportunity
              </TabsTrigger>
              <TabsTrigger value="interest" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Interest
              </TabsTrigger>
              <TabsTrigger value="vendor" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Vendor
              </TabsTrigger>
              <TabsTrigger value="category" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Category
              </TabsTrigger>
              <TabsTrigger value="forum" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Forum
              </TabsTrigger>
              <TabsTrigger value="profession" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Profession
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Activity
              </TabsTrigger>
              <TabsTrigger value="contact" className="rounded-xl px-6 py-3 font-semibold" style={{ color: '#B6C4E0' }}>
                Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8">
              <GeneralSummary metrics={generalMetrics} />
              
              {/* Analytics Charts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #3B82F6 0%, #7C3AED 100%)' }} />
                  <h2 className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
                    Analytics & Insights
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <UserGrowthChart users={users} />
                  <OpportunityDistributionChart opportunities={opportunities} />
                  <ActivityChart activities={activities} />
                  <InterestTrendsChart interests={interests} />
                </div>
              </motion.div>

              <OpportunitiesSummary metrics={opportunitiesMetrics} />
              <ConnectionSummary metrics={connectionMetrics} />
              <InterestsSummary metrics={interestsMetrics} />
            </TabsContent>

            <TabsContent value="users">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Users management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="partner">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Partner management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="opportunity">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Opportunity management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="interest">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Interest management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="vendor">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Vendor management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="category">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Category management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="forum">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Forum management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="profession">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Profession management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Activity management coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <div className="glass-card p-8 rounded-2xl text-center">
                <p style={{ color: '#7A8BA6' }}>Contact management coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}