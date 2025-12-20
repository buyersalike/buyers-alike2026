import React, { useState, useEffect } from "react";
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
import VendorProfileSection from "@/components/profile/VendorProfileSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const userEmail = urlParams.get('email');

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (!userEmail) {
        setProfileUser(user);
      }
    }).catch(() => setCurrentUser(null));
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!userEmail,
  });

  useEffect(() => {
    if (userEmail && users.length > 0) {
      const user = users.find(u => u.email === userEmail);
      setProfileUser(user);
    }
  }, [userEmail, users]);

  const isOwnProfile = currentUser?.email === profileUser?.email;

  if (!profileUser) {
    return (
      <div className="flex min-h-screen bg-gradient-main">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: '#7A8BA6' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-main">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <ProfileHeader user={profileUser} isOwnProfile={isOwnProfile} currentUser={currentUser} />

        <div className="max-w-6xl mx-auto px-8 py-8">
          {isOwnProfile && <VendorProfileSection userEmail={profileUser.email} />}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="glass-card mb-8 p-2 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <TabsTrigger 
                value="about" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:shadow-lg" 
                style={{ 
                  color: '#B6C4E0'
                }}
                data-state-active-style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', color: '#fff' }}
              >
                About
              </TabsTrigger>
              <TabsTrigger 
                value="interest" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:shadow-lg"
                style={{ color: '#B6C4E0' }}
              >
                Interest
              </TabsTrigger>
              <TabsTrigger 
                value="connection" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:shadow-lg"
                style={{ color: '#B6C4E0' }}
              >
                Connection
              </TabsTrigger>
              <TabsTrigger 
                value="opportunity" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:shadow-lg"
                style={{ color: '#B6C4E0' }}
              >
                Opportunity
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-xl px-6 py-3 font-semibold transition-all data-[state=active]:shadow-lg"
                style={{ color: '#B6C4E0' }}
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <AboutTab user={profileUser} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="interest">
              <InterestTab user={profileUser} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="connection">
              <ConnectionTab userEmail={profileUser.email} />
            </TabsContent>

            <TabsContent value="opportunity">
              <OpportunityTab userEmail={profileUser.email} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTab userEmail={profileUser.email} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}