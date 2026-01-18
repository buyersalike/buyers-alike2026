import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/partnerships/Sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  LogOut, 
  Users, 
  CheckCircle, 
  Clock,
  FileText,
  TrendingUp,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

const statusLabels = {
  intent_created: "Intent Created",
  pending_group_join: "Pending Group Join",
  accepted_into_group: "Accepted Into Group",
  approvals_complete: "Approvals Complete",
  group_forming: "Group Forming",
  documents_gathering: "Documents Gathering",
  partnership_active: "Partnership Active",
  partnership_completed: "Partnership Completed",
};

const statusIcons = {
  intent_created: Clock,
  pending_group_join: Clock,
  accepted_into_group: CheckCircle,
  approvals_complete: CheckCircle,
  group_forming: Users,
  documents_gathering: FileText,
  partnership_active: TrendingUp,
  partnership_completed: CheckCircle,
};

const statusOrder = [
  "intent_created",
  "pending_group_join",
  "accepted_into_group",
  "approvals_complete",
  "group_forming",
  "documents_gathering",
  "partnership_active",
  "partnership_completed"
];

export default function ActivityFeed() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => setCurrentUser(null));
  }, []);

  const { data: intents = [], isLoading } = useQuery({
    queryKey: ['partnership-intents', currentUser?.email],
    queryFn: () => base44.entities.PartnershipIntent.filter({ 
      user_email: currentUser?.email 
    }),
    enabled: !!currentUser,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['partnership-groups'],
    queryFn: () => base44.entities.PartnershipGroup.list(),
  });

  const leavePartnershipMutation = useMutation({
    mutationFn: async ({ intentId, groupId }) => {
      const group = groups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");

      // Update member status to 'left'
      const updatedMembers = group.members.map(m => 
        m.email === currentUser.email 
          ? { ...m, status: 'left' }
          : m
      );

      await base44.entities.PartnershipGroup.update(groupId, {
        members: updatedMembers
      });

      // Update intent status
      await base44.entities.PartnershipIntent.update(intentId, {
        current_status: 'withdrawn'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-intents'] });
      queryClient.invalidateQueries({ queryKey: ['partnership-groups'] });
      toast.success("Successfully left the partnership");
      setShowGroupDetails(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave partnership");
    },
  });

  const getGroupProgress = (status) => {
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const getGroupForIntent = (intent) => {
    return groups.find(g => g.id === intent.group_id);
  };

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)', minHeight: '100vh' }}>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#D8A11F' }}></div>
            <p className="mt-4" style={{ color: '#E5EDFF' }}>Loading your partnerships...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#E5EDFF' }}>Partnership Activity</h1>
            <p style={{ color: '#B6C4E0' }}>Track your partnership journey and group formation progress</p>
          </motion.div>

          {intents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 rounded-3xl text-center"
            >
              <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#7A8BA6' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#E5EDFF' }}>No Active Partnerships</h2>
              <p style={{ color: '#B6C4E0' }}>Express interest in opportunities to start forming partnerships</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {intents.map((intent, index) => {
                  const group = getGroupForIntent(intent);
                  const progress = getGroupProgress(intent.current_status);
                  const StatusIcon = statusIcons[intent.current_status] || Clock;

                  return (
                    <motion.div
                      key={intent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-6 rounded-3xl"
                    >
                      <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
                              {intent.opportunity_name}
                            </h3>
                            <div className="flex items-center gap-3 mb-3">
                              <span
                                className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                                style={{ background: 'rgba(216, 161, 31, 0.2)', color: '#D8A11F' }}
                              >
                                <StatusIcon className="w-4 h-4" />
                                {statusLabels[intent.current_status]}
                              </span>
                            </div>
                            {intent.opportunity_description && (
                              <p className="mb-4" style={{ color: '#B6C4E0' }}>
                                {intent.opportunity_description}
                              </p>
                            )}
                          </div>
                        </div>

                        {group && (
                          <div className="glass-card p-4 rounded-2xl mb-4" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" style={{ color: '#D8A11F' }} />
                                <span className="font-semibold" style={{ color: '#E5EDFF' }}>
                                  Group: {group.name}
                                </span>
                              </div>
                              <span className="text-sm" style={{ color: '#B6C4E0' }}>
                                Members: {group.members?.filter(m => m.status === 'active').length || 0}/{group.max_members}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium" style={{ color: '#B6C4E0' }}>Group Forming</span>
                          <span className="text-sm font-bold" style={{ color: '#D8A11F' }}>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 rounded-full mb-6" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #D8A11F 0%, #F59E0B 100%)' }}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                          {statusOrder.map((status, idx) => {
                            const Icon = statusIcons[status];
                            const isComplete = statusOrder.indexOf(intent.current_status) >= idx;
                            const isCurrent = intent.current_status === status;

                            return (
                              <div
                                key={status}
                                className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                                  isCurrent ? 'glass-card' : ''
                                }`}
                                style={{
                                  background: isCurrent 
                                    ? 'rgba(216, 161, 31, 0.2)' 
                                    : isComplete 
                                    ? 'rgba(255, 255, 255, 0.05)' 
                                    : 'rgba(255, 255, 255, 0.02)',
                                  border: isCurrent ? '1px solid #D8A11F' : '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                              >
                                {isComplete ? (
                                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} />
                                ) : (
                                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#7A8BA6' }} />
                                )}
                                <span 
                                  className="text-xs font-medium"
                                  style={{ color: isComplete ? '#E5EDFF' : '#7A8BA6' }}
                                >
                                  {statusLabels[status]}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-3">
                          {group && (
                            <Button
                              onClick={() => {
                                setSelectedGroup({ ...group, intent });
                                setShowGroupDetails(true);
                              }}
                              className="flex-1 rounded-xl py-6 font-bold flex items-center justify-center gap-2"
                              style={{ background: '#3B82F6', color: '#fff' }}
                            >
                              <Eye className="w-5 h-5" />
                              View Group Details
                            </Button>
                          )}
                          {intent.current_status !== 'partnership_completed' && intent.current_status !== 'withdrawn' && (
                            <Button
                              onClick={() => {
                                if (confirm('Are you sure you want to leave this partnership?')) {
                                  leavePartnershipMutation.mutate({ 
                                    intentId: intent.id, 
                                    groupId: intent.group_id 
                                  });
                                }
                              }}
                              disabled={leavePartnershipMutation.isPending}
                              variant="outline"
                              className="flex-1 rounded-xl py-6 font-bold flex items-center justify-center gap-2"
                              style={{ borderColor: '#EF4444', color: '#EF4444' }}
                            >
                              <LogOut className="w-5 h-5" />
                              Leave Partnership
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Group Details Dialog */}
        <Dialog open={showGroupDetails} onOpenChange={setShowGroupDetails}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" style={{ background: '#192234', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            {selectedGroup && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold" style={{ color: '#E5EDFF' }}>
                    {selectedGroup.name}
                  </DialogTitle>
                  <DialogDescription style={{ color: '#B6C4E0' }}>
                    {selectedGroup.opportunity_name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Group Status */}
                  <div className="glass-card p-4 rounded-2xl">
                    <h4 className="font-bold mb-2" style={{ color: '#E5EDFF' }}>Group Status</h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />
                      <span className="text-lg font-semibold" style={{ color: '#E5EDFF' }}>
                        {selectedGroup.status}
                      </span>
                    </div>
                  </div>

                  {/* Active Members */}
                  <div className="glass-card p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold" style={{ color: '#E5EDFF' }}>Active Members</h4>
                      <span className="text-sm" style={{ color: '#B6C4E0' }}>
                        {selectedGroup.members?.filter(m => m.status === 'active').length || 0}/{selectedGroup.max_members}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedGroup.members?.filter(m => m.status === 'active').map((member, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: '#D8A11F', color: '#fff' }}>
                            {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold" style={{ color: '#E5EDFF' }}>{member.name || member.email}</p>
                            <p className="text-xs" style={{ color: '#7A8BA6' }}>
                              Joined {new Date(member.joined_date).toLocaleDateString()}
                            </p>
                          </div>
                          {member.email === selectedGroup.creator_email && (
                            <span className="text-xs px-2 py-1 rounded" style={{ background: '#D8A11F', color: '#fff' }}>
                              Creator
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Members */}
                  {selectedGroup.pending_members && selectedGroup.pending_members.length > 0 && (
                    <div className="glass-card p-4 rounded-2xl">
                      <h4 className="font-bold mb-3" style={{ color: '#E5EDFF' }}>Pending Members</h4>
                      <div className="space-y-2">
                        {selectedGroup.pending_members.map((member, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                          >
                            <Clock className="w-5 h-5" style={{ color: '#F59E0B' }} />
                            <div className="flex-1">
                              <p className="font-semibold" style={{ color: '#E5EDFF' }}>{member.name || member.email}</p>
                              <p className="text-xs" style={{ color: '#7A8BA6' }}>
                                Requested {new Date(member.requested_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedGroup.documents && selectedGroup.documents.length > 0 && (
                    <div className="glass-card p-4 rounded-2xl">
                      <h4 className="font-bold mb-3" style={{ color: '#E5EDFF' }}>Documents</h4>
                      <div className="space-y-2">
                        {selectedGroup.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-opacity"
                            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                          >
                            <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                            <div className="flex-1">
                              <p className="font-semibold" style={{ color: '#E5EDFF' }}>{doc.name}</p>
                              <p className="text-xs" style={{ color: '#7A8BA6' }}>
                                Uploaded by {doc.uploaded_by} on {new Date(doc.uploaded_date).toLocaleDateString()}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedGroup.notes && (
                    <div className="glass-card p-4 rounded-2xl">
                      <h4 className="font-bold mb-2" style={{ color: '#E5EDFF' }}>Group Notes</h4>
                      <p style={{ color: '#B6C4E0' }}>{selectedGroup.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}