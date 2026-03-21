import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/partnerships/Sidebar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutTab from "@/components/profile/AboutTab";
import InterestTab from "@/components/profile/InterestTab";
import ConnectionTab from "@/components/profile/ConnectionTab";
import OpportunityTab from "@/components/profile/OpportunityTab";
import ActivityTab from "@/components/profile/ActivityTab";
import SavedListingsTab from "@/components/profile/SavedListingsTab";
import VendorProfileSection from "@/components/profile/VendorProfileSection";
import ProfileCompletionWizard from "@/components/profile/ProfileCompletionWizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("about");
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const userEmail = urlParams.get('email');

  // Always fetch current user via query so it auto-refreshes on invalidation
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch other user's profile if viewing someone else
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!userEmail,
  });

  const profileUser = userEmail
    ? users.find(u => u.email === userEmail) || null
    : currentUser || null;

  const isOwnProfile = currentUser?.email === profileUser?.email;

  if (!profileUser) {
    return (
      <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#000' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F2F1F5' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <ProfileHeader user={profileUser} isOwnProfile={isOwnProfile} currentUser={currentUser} />

        <div className="max-w-6xl mx-auto px-8 py-8">
          {isOwnProfile && (
            <ProfileCompletionWizard 
              user={profileUser} 
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}
          {isOwnProfile && <VendorProfileSection userEmail={profileUser.email} />}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 p-2 rounded-2xl" style={{ background: '#fff', border: '1px solid #000' }}>
              <TabsTrigger 
                value="about" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white" 
                style={{ color: '#000' }}
              >
                About
              </TabsTrigger>
              <TabsTrigger 
                value="interest" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white"
                style={{ color: '#000' }}
              >
                Interest
              </TabsTrigger>
              <TabsTrigger 
                value="connection" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white"
                style={{ color: '#000' }}
              >
                Connection
              </TabsTrigger>
              <TabsTrigger 
                value="opportunity" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white"
                style={{ color: '#000' }}
              >
                Opportunity
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white"
                style={{ color: '#000' }}
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:bg-[#D8A11F] data-[state=active]:text-white"
                style={{ color: '#000' }}
              >
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <AboutTab user={profileUser} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="interest">
              <InterestTab user={profileUser} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="connection">
              <ConnectionTab userEmail={profileUser.email} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="opportunity">
              <OpportunityTab userEmail={profileUser.email} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab userEmail={profileUser.email} />
            </TabsContent>

            <TabsContent value="saved">
              <SavedListingsTab userEmail={profileUser.email} isOwnProfile={isOwnProfile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}