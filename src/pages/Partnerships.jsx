import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/partnerships/Sidebar";
import FilterBar from "@/components/partnerships/FilterBar";
import PartnershipCard from "@/components/partnerships/PartnershipCard";
import AdvancedFilters from "@/components/partnerships/AdvancedFilters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import SEO from "@/components/seo/SEO";
import { pageMetadata } from "@/components/seo/seoMetadata";
import { Users, FileText, TrendingUp, Clock } from "lucide-react";
import UpgradeCard from "@/components/app/UpgradeCard";

const ACTIVE_STATUSES = ["accepted_into_group", "group_forming", "approvals_complete", "documents_gathering", "partnership_active"];
const INTENT_STATUSES = ["intent_created", "pending_group_join"];
const COMPLETED_STATUSES = ["partnership_completed"];
const DECLINED_STATUSES = ["rejected", "withdrawn"];

const tabs = [
  { id: "active", label: "My Active Partnerships" },
  { id: "intent", label: "My Partnership Intents" },
  { id: "available", label: "Available Groups to Join" },
  { id: "completed", label: "Completed Partnerships" },
  { id: "declined", label: "Declined/Withdrawn/Canceled" }
];

export default function Partnerships() {
  const metadata = pageMetadata.Partnerships;
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("active");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filters, setFilters] = useState({
    industry: "all", companySize: "all", location: "", investmentMin: "", investmentMax: "", sortBy: "match_score"
  });
  const queryClient = useQueryClient();

  // Verify checkout on success redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('checkout') === 'success') {
      base44.functions.invoke('verifyCheckout', {}).then(res => {
        if (res.data?.updated) {
          // Refresh user data
          base44.auth.me().then(user => setCurrentUser(user));
          toast.success(`Welcome to the ${res.data.plan === 'professional' ? 'Professional' : 'Enterprise'} plan!`);
        }
      }).catch(() => {});
      // Clean up URL
      window.history.replaceState({}, '', '/Partnerships');
    }
  }, [location.search]);

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: intents = [], isLoading: loadingIntents } = useQuery({
    queryKey: ['partnership-intents', currentUser?.email],
    queryFn: () => base44.entities.PartnershipIntent.filter({ user_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: allGroups = [] } = useQuery({
    queryKey: ['partnership-groups'],
    queryFn: () => base44.entities.PartnershipGroup.list(),
  });

  const leavePartnershipMutation = useMutation({
    mutationFn: async ({ intentId, groupId }) => {
      const group = allGroups.find(g => g.id === groupId);
      if (group) {
        const updatedMembers = (group.members || []).map(m =>
          m.email === currentUser.email ? { ...m, status: 'left' } : m
        );
        await base44.entities.PartnershipGroup.update(groupId, { members: updatedMembers });
      }
      const intent = intents.find(i => i.id === intentId);
      const statusHistory = [...(intent?.status_history || []), {
        status: 'withdrawn',
        timestamp: new Date().toISOString(),
        notes: 'User voluntarily withdrew from partnership'
      }];
      await base44.entities.PartnershipIntent.update(intentId, {
        current_status: 'withdrawn',
        status_history: statusHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-intents'] });
      queryClient.invalidateQueries({ queryKey: ['partnership-groups'] });
      toast.success("Successfully left the partnership");
      setSelectedGroup(null);
    },
    onError: (error) => toast.error(error.message || "Failed to leave partnership"),
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (group) => {
      const pendingMembers = [...(group.pending_members || []), {
        email: currentUser.email,
        name: currentUser.full_name,
        requested_date: new Date().toISOString()
      }];
      await base44.entities.PartnershipGroup.update(group.id, { pending_members: pendingMembers });
      await base44.entities.PartnershipIntent.create({
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        opportunity_id: group.opportunity_id,
        opportunity_name: group.opportunity_name,
        opportunity_description: group.opportunity_description,
        current_status: 'pending_group_join',
        group_id: group.id,
        group_name: group.name,
        status_history: [{ status: 'pending_group_join', timestamp: new Date().toISOString(), notes: 'Requested to join existing group' }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-intents'] });
      queryClient.invalidateQueries({ queryKey: ['partnership-groups'] });
      toast.success("Join request submitted!");
    },
    onError: (error) => toast.error(error.message || "Failed to join group"),
  });

  // Compute data per tab
  const getGroupForIntent = (intent) => allGroups.find(g => g.id === intent.group_id);

  const categorized = useMemo(() => {
    const myGroupIds = new Set(intents.map(i => i.group_id).filter(Boolean));
    const myPendingGroupIds = new Set(
      allGroups
        .filter(g => (g.pending_members || []).some(m => m.email === currentUser?.email))
        .map(g => g.id)
    );

    return {
      active: intents.filter(i => ACTIVE_STATUSES.includes(i.current_status)),
      intent: intents.filter(i => INTENT_STATUSES.includes(i.current_status)),
      available: allGroups.filter(g =>
        !myGroupIds.has(g.id) &&
        !myPendingGroupIds.has(g.id) &&
        g.status === 'forming' &&
        (g.members || []).filter(m => m.status === 'active').length < (g.max_members || 20)
      ),
      completed: intents.filter(i => COMPLETED_STATUSES.includes(i.current_status)),
      declined: intents.filter(i => DECLINED_STATUSES.includes(i.current_status)),
    };
  }, [intents, allGroups, currentUser]);

  const tabsWithCounts = tabs.map(t => ({ ...t, count: categorized[t.id]?.length || 0 }));

  // Apply advanced filters to current tab items
  const currentItems = useMemo(() => {
    const items = categorized[activeTab] || [];
    const hasActiveFilters = filters.location || filters.investmentMin || filters.investmentMax || 
      (filters.industry && filters.industry !== 'all') || (filters.companySize && filters.companySize !== 'all');

    if (!hasActiveFilters && filters.sortBy === 'match_score') return items;

    const getGroupData = (item) => {
      if (activeTab === 'available') return item; // item IS the group
      return allGroups.find(g => g.id === item.group_id) || {};
    };

    const parseInvestment = (str) => {
      if (!str) return 0;
      return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
    };

    let filtered = items.filter(item => {
      const group = getGroupData(item);
      const name = (group.opportunity_name || group.name || item.opportunity_name || '').toLowerCase();
      const desc = (group.opportunity_description || item.opportunity_description || '').toLowerCase();
      const type = (group.opportunity_type || '').toLowerCase();
      const allText = `${name} ${desc} ${type}`;

      // Location filter
      if (filters.location) {
        const loc = filters.location.toLowerCase();
        if (!allText.includes(loc)) return false;
      }

      // Industry filter - match against opportunity_type and description
      if (filters.industry && filters.industry !== 'all') {
        const industry = filters.industry.toLowerCase();
        if (!allText.includes(industry)) return false;
      }

      // Company size filter - match against member count
      if (filters.companySize && filters.companySize !== 'all') {
        const activeMembers = (group.members || []).filter(m => m.status === 'active').length;
        const range = filters.companySize;
        if (range === '1-10' && activeMembers > 10) return false;
        if (range === '11-25' && (activeMembers < 11 || activeMembers > 25)) return false;
        if (range === '26-50' && (activeMembers < 26 || activeMembers > 50)) return false;
        if (range === '51-100' && (activeMembers < 51 || activeMembers > 100)) return false;
        if (range === '101-250' && (activeMembers < 101 || activeMembers > 250)) return false;
        if (range === '251+' && activeMembers < 251) return false;
      }

      // Investment range filter
      if (filters.investmentMin || filters.investmentMax) {
        const investNum = parseInvestment(group.opportunity_investment);
        if (filters.investmentMin && investNum > 0 && investNum < parseFloat(filters.investmentMin)) return false;
        if (filters.investmentMax && investNum > 0 && investNum > parseFloat(filters.investmentMax)) return false;
        // If no investment data and user set a filter, exclude the item
        if (investNum === 0 && (filters.investmentMin || filters.investmentMax)) return false;
      }

      return true;
    });

    // Sort
    if (filters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (filters.sortBy === 'deal_size_high' || filters.sortBy === 'deal_size_low') {
      filtered.sort((a, b) => {
        const gA = getGroupData(a);
        const gB = getGroupData(b);
        const valA = parseInvestment(gA.opportunity_investment);
        const valB = parseInvestment(gB.opportunity_investment);
        return filters.sortBy === 'deal_size_high' ? valB - valA : valA - valB;
      });
    } else if (filters.sortBy === 'company_size') {
      filtered.sort((a, b) => {
        const gA = getGroupData(a);
        const gB = getGroupData(b);
        const countA = (gA.members || []).filter(m => m.status === 'active').length;
        const countB = (gB.members || []).filter(m => m.status === 'active').length;
        return countB - countA;
      });
    }

    return filtered;
  }, [categorized, activeTab, filters, allGroups]);

  return (
    <div className="flex">
      <SEO title={metadata.title} description={metadata.description} keywords={metadata.keywords} />
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: 'calc(100vh - 73px)', background: '#F2F1F5' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#000' }}>My Partnerships</h1>
            <p style={{ color: '#000' }}>Manage your active, pending, and completed partnerships</p>
          </div>

          <UpgradeCard user={currentUser} />

          {/* Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {tabsWithCounts.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap"
                  style={activeTab === tab.id
                    ? { background: '#D8A11F', color: '#fff' }
                    : { background: 'rgba(255, 255, 255, 0.8)', color: '#000', border: '1px solid rgba(0, 0, 0, 0.1)' }
                  }
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={
                      activeTab === tab.id
                        ? { background: 'rgba(255, 255, 255, 0.3)', color: '#fff' }
                        : { background: 'rgba(0, 0, 0, 0.1)', color: '#000' }
                    }>
                      {tab.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mb-6">
            <AdvancedFilters filters={filters} setFilters={setFilters} isOpen={filtersOpen} setIsOpen={setFiltersOpen} />
          </div>

          <FilterBar viewMode={viewMode} setViewMode={setViewMode} totalResults={currentItems.length} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} />


          {/* Content */}
          {loadingIntents ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D8A11F' }} />
              <p style={{ color: '#666' }}>Loading partnerships...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}>
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#ccc' }} />
              <p className="text-lg font-semibold" style={{ color: '#000' }}>No partnerships in this category</p>
              <p className="text-sm mt-1" style={{ color: '#666' }}>
                {activeTab === 'active' ? 'Express interest in opportunities to start forming partnerships' :
                 activeTab === 'available' ? 'No open groups to join at this time' :
                 'Nothing to show here yet'}
              </p>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-6"}>
              {activeTab === 'available' ? (
                currentItems.map((group, index) => (
                  <PartnershipCard
                    key={group.id}
                    group={group}
                    mode="available"
                    index={index}
                    onJoin={() => {
                      if (confirm(`Request to join "${group.name}"?`)) {
                        joinGroupMutation.mutate(group);
                      }
                    }}
                    onViewDetails={() => setSelectedGroup({ group, intent: null })}
                  />
                ))
              ) : (
                currentItems.map((intent, index) => {
                  const group = getGroupForIntent(intent);
                  return (
                    <PartnershipCard
                      key={intent.id}
                      intent={intent}
                      group={group}
                      mode={activeTab}
                      index={index}
                      onViewDetails={() => setSelectedGroup({ group, intent })}
                      onLeave={() => {
                        if (confirm('Are you sure you want to leave this partnership?')) {
                          leavePartnershipMutation.mutate({ intentId: intent.id, groupId: intent.group_id });
                        }
                      }}
                      leavePending={leavePartnershipMutation.isPending}
                    />
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      {/* Group Details Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: '#192234', borderColor: 'rgba(255,255,255,0.2)' }}>
          {selectedGroup && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold" style={{ color: '#E5EDFF' }}>
                  {selectedGroup.group?.name}
                </DialogTitle>
                <DialogDescription style={{ color: '#B6C4E0' }}>
                  {selectedGroup.group?.opportunity_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Status */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#B6C4E0' }}>Group Status</p>
                  <p className="font-bold capitalize" style={{ color: '#D8A11F' }}>{selectedGroup.group?.status?.replace(/_/g, ' ')}</p>
                </div>
                {/* Members */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold" style={{ color: '#E5EDFF' }}>Active Members</p>
                    <span className="text-sm" style={{ color: '#B6C4E0' }}>
                      {selectedGroup.group?.members?.filter(m => m.status === 'active').length || 0}/{selectedGroup.group?.max_members || 20}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedGroup.group?.members?.filter(m => m.status === 'active').map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#D8A11F', color: '#fff' }}>
                          {(member.name || member.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{member.name || member.email}</p>
                          <p className="text-xs" style={{ color: '#7A8BA6' }}>Joined {new Date(member.joined_date).toLocaleDateString()}</p>
                        </div>
                        {member.email === selectedGroup.group?.creator_email && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: '#D8A11F', color: '#fff' }}>Creator</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Pending members */}
                {selectedGroup.group?.pending_members?.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="font-semibold mb-3" style={{ color: '#E5EDFF' }}>Pending Members ({selectedGroup.group.pending_members.length})</p>
                    <div className="space-y-2">
                      {selectedGroup.group.pending_members.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <Clock className="w-4 h-4" style={{ color: '#F59E0B' }} />
                          <p className="text-sm" style={{ color: '#B6C4E0' }}>{member.name || member.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Documents */}
                {selectedGroup.group?.documents?.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="font-semibold mb-3" style={{ color: '#E5EDFF' }}>Documents</p>
                    <div className="space-y-2">
                      {selectedGroup.group.documents.map((doc, idx) => (
                        <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:opacity-80"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                          <FileText className="w-4 h-4" style={{ color: '#3B82F6' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{doc.name}</p>
                            <p className="text-xs" style={{ color: '#7A8BA6' }}>By {doc.uploaded_by}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {/* Notes */}
                {selectedGroup.group?.notes && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="font-semibold mb-2" style={{ color: '#E5EDFF' }}>Notes</p>
                    <p className="text-sm" style={{ color: '#B6C4E0' }}>{selectedGroup.group.notes}</p>
                  </div>
                )}
                {/* Status History */}
                {selectedGroup.intent?.status_history?.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="font-semibold mb-3" style={{ color: '#E5EDFF' }}>Status History</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[...selectedGroup.intent.status_history].reverse().map((entry, idx) => (
                        <div key={idx} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold capitalize" style={{ color: '#D8A11F' }}>
                              {entry.status?.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs" style={{ color: '#7A8BA6' }}>
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {entry.notes && <p className="text-xs" style={{ color: '#B6C4E0' }}>{entry.notes}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}