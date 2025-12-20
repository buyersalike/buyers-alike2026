import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import Sidebar from "@/components/partnerships/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { canAccessAdmin, hasPermission } from "@/components/utils/permissions";
import RolesManagementTab from "@/components/admin/RolesManagementTab";
import GeneralSummary from "@/components/admin/GeneralSummary";
import OpportunitiesSummary from "@/components/admin/OpportunitiesSummary";
import ConnectionSummary from "@/components/admin/ConnectionSummary";
import InterestsSummary from "@/components/admin/InterestsSummary";
import UserGrowthChart from "@/components/admin/UserGrowthChart";
import OpportunityDistributionChart from "@/components/admin/OpportunityDistributionChart";
import ActivityChart from "@/components/admin/ActivityChart";
import InterestTrendsChart from "@/components/admin/InterestTrendsChart";
import UsersTable from "@/components/admin/UsersTable";
import VendorApplicationsTable from "@/components/admin/VendorApplicationsTable";
import AdCampaignApplicationsTable from "@/components/admin/AdCampaignApplicationsTable";
import AdCampaignsSummary from "@/components/admin/AdCampaignsSummary";
import VendorCategoriesTab from "@/components/admin/VendorCategoriesTab";
import AdCampaignChart from "@/components/admin/AdCampaignChart";
import CategoryManagementTab from "@/components/admin/CategoryManagementTab";
import SystemActivityFeed from "@/components/admin/SystemActivityFeed";
import ForumCategoriesManagementTab from "@/components/admin/ForumCategoriesManagementTab";
import ContactManagementTab from "@/components/admin/ContactManagementTab";
import ProfessionManagementTab from "@/components/admin/ProfessionManagementTab";
import InterestManagementTab from "@/components/admin/InterestManagementTab";

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

  // Fetch all data based on permissions
  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!currentUser && hasPermission(currentUser.role, 'canManageUsers'),
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['allOpportunities'],
    queryFn: () => base44.entities.Opportunity.list(),
    enabled: !!currentUser && canAccessAdmin(currentUser.role),
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['allConnections'],
    queryFn: () => base44.entities.Connection.list(),
    enabled: !!currentUser && canAccessAdmin(currentUser.role),
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['allInterests'],
    queryFn: () => base44.entities.Interest.list(),
    enabled: !!currentUser && canAccessAdmin(currentUser.role),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['allGroups'],
    queryFn: () => base44.entities.GroupChat.list(),
    enabled: !!currentUser && canAccessAdmin(currentUser.role),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['allActivities'],
    queryFn: () => base44.entities.Activity.list(),
    enabled: !!currentUser && hasPermission(currentUser.role, 'canViewAnalytics'),
  });

  const { data: adCampaigns = [] } = useQuery({
    queryKey: ['allAdCampaigns'],
    queryFn: () => base44.entities.AdvertiseApplication.list(),
    enabled: !!currentUser && hasPermission(currentUser.role, 'canManageAdvertisements'),
  });

  const { data: adMetrics = [] } = useQuery({
    queryKey: ['allAdMetrics'],
    queryFn: () => base44.entities.AdMetrics.list(),
    enabled: !!currentUser && hasPermission(currentUser.role, 'canManageAdvertisements'),
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

  const adCampaignsMetrics = {
    total: adCampaigns.length,
    active: adCampaigns.filter(c => {
      if (c.status !== 'approved') return false;
      if (!c.expiry_date) return true;
      return new Date(c.expiry_date) > new Date();
    }).length,
    pending: adCampaigns.filter(c => c.status === 'pending').length,
    rejected: adCampaigns.filter(c => c.status === 'rejected').length,
    totalImpressions: adMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    totalRevenue: adCampaigns.filter(c => c.status === 'approved').reduce((sum, c) => {
      // Estimate revenue based on package type (simplified calculation)
      const packageCosts = { 'basic': 500, 'premium': 1000, 'enterprise': 2000 };
      return sum + (packageCosts[c.package] || 500);
    }, 0),
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#000' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !canAccessAdmin(currentUser.role)) {
    return (
      <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#EF4444' }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#000' }}>
              Access Denied
            </h2>
            <p style={{ color: '#666' }}>
              You need administrator privileges to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-8 mb-6"
            style={{
              background: '#fff',
              border: '2px solid #000',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            }}
          >
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
                <h1 className="text-4xl font-black mb-2" style={{ color: '#000' }}>
                  Admin Dashboard
                </h1>
                <p className="text-base font-medium" style={{ color: '#666' }}>
                  Monitor and manage platform metrics
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList 
              className="w-full p-3 rounded-3xl mb-8 flex-wrap justify-start gap-1 h-auto items-center"
              style={{ 
                background: '#fff',
                border: '2px solid #000',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              <TabsTrigger value="dashboard" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                Dashboard
              </TabsTrigger>
              {hasPermission(currentUser.role, 'canManageUsers') && (
                <TabsTrigger value="users" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Users
                </TabsTrigger>
              )}
              <TabsTrigger value="partner" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                Partner
              </TabsTrigger>
              {hasPermission(currentUser.role, 'canManageOpportunities') && (
                <TabsTrigger value="opportunity" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Opportunity
                </TabsTrigger>
              )}
              <TabsTrigger value="interest" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                Interest
              </TabsTrigger>
              {hasPermission(currentUser.role, 'canManageVendors') && (
                <TabsTrigger value="vendor" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Vendor
                </TabsTrigger>
              )}
              {hasPermission(currentUser.role, 'canManageAdvertisements') && (
                <TabsTrigger value="ad-campaigns" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Ad Campaigns
                </TabsTrigger>
              )}
              {hasPermission(currentUser.role, 'canManageContent') && (
                <TabsTrigger value="category" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Category
                </TabsTrigger>
              )}
              {hasPermission(currentUser.role, 'canManageForum') && (
                <TabsTrigger value="forum" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Forum
                </TabsTrigger>
              )}
              <TabsTrigger value="profession" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                Profession
              </TabsTrigger>
              {hasPermission(currentUser.role, 'canViewAnalytics') && (
                <TabsTrigger value="activity" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Activity
                </TabsTrigger>
              )}
              <TabsTrigger value="contact" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                Contact
              </TabsTrigger>
              {currentUser.role === 'admin' && (
                <TabsTrigger value="roles" className="rounded-xl px-4 py-2.5 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white whitespace-nowrap" style={{ color: '#000' }}>
                  Roles
                </TabsTrigger>
              )}
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
                  <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
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
              <AdCampaignsSummary metrics={adCampaignsMetrics} />
              
              {/* Ad Campaign Analytics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #F59E0B 100%)' }} />
                  <h2 className="text-2xl font-bold" style={{ color: '#000' }}>
                    Advertising Analytics
                  </h2>
                </div>
                <AdCampaignChart campaigns={adCampaigns} metrics={adMetrics} />
              </motion.div>
            </TabsContent>

            {hasPermission(currentUser.role, 'canManageUsers') && (
              <TabsContent value="users">
                <UsersTable users={users} />
              </TabsContent>
            )}

            <TabsContent value="partner">
              <div className="p-8 rounded-2xl text-center" style={{ background: '#fff', border: '2px solid #000' }}>
                <p style={{ color: '#666' }}>Partner management coming soon...</p>
              </div>
            </TabsContent>

            {hasPermission(currentUser.role, 'canManageOpportunities') && (
              <TabsContent value="opportunity">
                <div className="p-8 rounded-2xl text-center" style={{ background: '#fff', border: '2px solid #000' }}>
                  <p style={{ color: '#666' }}>Opportunity management coming soon...</p>
                </div>
              </TabsContent>
            )}

            <TabsContent value="interest">
              <InterestManagementTab />
            </TabsContent>

            {hasPermission(currentUser.role, 'canManageVendors') && (
              <TabsContent value="vendor" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>Vendor Applications</h3>
                  <p className="text-sm mb-4" style={{ color: '#666' }}>Review and approve vendor applications</p>
                  <VendorApplicationsTable />
                </div>
                <div className="mt-8">
                  <VendorCategoriesTab />
                </div>
              </TabsContent>
            )}

            {hasPermission(currentUser.role, 'canManageAdvertisements') && (
              <TabsContent value="ad-campaigns" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#000' }}>Ad Campaign Applications</h3>
                  <p className="text-sm mb-4" style={{ color: '#666' }}>Review and approve ad campaign applications</p>
                </div>
                <AdCampaignApplicationsTable />
              </TabsContent>
            )}

            {hasPermission(currentUser.role, 'canManageContent') && (
              <TabsContent value="category">
                <CategoryManagementTab />
              </TabsContent>
            )}

            {hasPermission(currentUser.role, 'canManageForum') && (
              <TabsContent value="forum">
                <ForumCategoriesManagementTab />
              </TabsContent>
            )}

            <TabsContent value="profession">
              <ProfessionManagementTab />
            </TabsContent>

            {hasPermission(currentUser.role, 'canViewAnalytics') && (
              <TabsContent value="activity">
                <SystemActivityFeed />
              </TabsContent>
            )}

            <TabsContent value="contact">
              <ContactManagementTab />
            </TabsContent>

            {currentUser.role === 'admin' && (
              <TabsContent value="roles">
                <RolesManagementTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}