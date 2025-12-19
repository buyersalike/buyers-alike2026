import React, { useState, useEffect } from "react";
import Sidebar from "@/components/partnerships/Sidebar";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Eye, MousePointerClick, CheckCircle } from "lucide-react";
import CampaignList from "@/components/adcampaigns/CampaignList";
import AnalyticsDashboard from "@/components/adcampaigns/AnalyticsDashboard";
import PerformanceCards from "@/components/adcampaigns/PerformanceCards";
import ExpiringAdsNotice from "@/components/adcampaigns/ExpiringAdsNotice";
import AdvertiseBanner from "@/components/vendors/AdvertiseBanner";
import AdvertiseApplicationDialog from "@/components/vendors/AdvertiseApplicationDialog";

export default function AdCampaigns() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdvertiseDialogOpen, setIsAdvertiseDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['ad-campaigns', currentUser?.email],
    queryFn: () => base44.entities.AdvertiseApplication.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: allMetrics = [] } = useQuery({
    queryKey: ['ad-metrics', currentUser?.email],
    queryFn: async () => {
      const userCampaigns = await base44.entities.AdvertiseApplication.filter({ user_email: currentUser.email });
      const vendorIds = [...new Set(userCampaigns.map(c => c.vendor_id))];
      const allMetrics = [];
      for (const vendorId of vendorIds) {
        const metrics = await base44.entities.AdMetrics.filter({ vendor_id: vendorId });
        allMetrics.push(...metrics);
      }
      return allMetrics;
    },
    enabled: !!currentUser?.email,
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'approved' && (!c.expiry_date || new Date(c.expiry_date) > new Date()));
  const expiredCampaigns = campaigns.filter(c => c.status === 'expired' || (c.expiry_date && new Date(c.expiry_date) <= new Date()));

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8" style={{ color: '#D8A11F' }} />
              <h1 className="text-3xl font-bold" style={{ color: '#000' }}>
                Ad Campaign Management
              </h1>
            </div>
            <p style={{ color: '#666' }}>
              Monitor performance, manage campaigns, and optimize your advertising strategy
            </p>
          </div>

          {/* Apply to Advertise Banner */}
          <AdvertiseBanner onApplyClick={() => setIsAdvertiseDialogOpen(true)} />

          {/* Advertise Application Dialog */}
          <AdvertiseApplicationDialog 
            open={isAdvertiseDialogOpen} 
            onOpenChange={setIsAdvertiseDialogOpen}
          />

          {/* Expiring Ads Notice */}
          <ExpiringAdsNotice campaigns={activeCampaigns} />

          {/* Performance Overview Cards */}
          <PerformanceCards campaigns={campaigns} metrics={allMetrics} />

          {/* Analytics Dashboard */}
          <AnalyticsDashboard campaigns={campaigns} metrics={allMetrics} />

          {/* Campaign Management Tabs */}
          <Tabs defaultValue="active" className="mt-8">
            <TabsList className="p-2 rounded-2xl mb-6" style={{ background: '#fff', border: '1px solid #000' }}>
              <TabsTrigger value="active" className="rounded-xl px-6 py-3 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
                Active Campaigns ({activeCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="expired" className="rounded-xl px-6 py-3 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
                Expired Campaigns ({expiredCampaigns.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-xl px-6 py-3 font-semibold data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" style={{ color: '#000' }}>
                All Campaigns ({campaigns.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <CampaignList campaigns={activeCampaigns} metrics={allMetrics} type="active" />
            </TabsContent>

            <TabsContent value="expired">
              <CampaignList campaigns={expiredCampaigns} metrics={allMetrics} type="expired" />
            </TabsContent>

            <TabsContent value="all">
              <CampaignList campaigns={campaigns} metrics={allMetrics} type="all" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}