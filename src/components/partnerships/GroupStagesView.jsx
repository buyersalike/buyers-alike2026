import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Users, CheckCircle2, Circle, Clock, FileText, ChevronRight,
  Home, MapPin, Eye
} from "lucide-react";
import StageAdvancementControls from "./StageAdvancementControls";
import DocumentUploadSection from "./DocumentUploadSection";

const statusOrder = [
  "intent_created", "pending_group_join", "accepted_into_group",
  "group_forming", "approvals_complete", "documents_gathering",
  "partnership_active", "partnership_completed"
];

const statusLabels = {
  intent_created: "Intent Created",
  pending_group_join: "Pending Group Join",
  accepted_into_group: "Accepted into Group",
  group_forming: "Group Forming",
  approvals_complete: "Approvals Complete",
  documents_gathering: "Document Gathering",
  partnership_active: "Partnership Active",
  partnership_completed: "Partnership Completed",
};

const groupStatusToIntentStatus = {
  forming: "group_forming",
  approvals_complete: "approvals_complete",
  documents_gathering: "documents_gathering",
  active: "partnership_active",
  completed: "partnership_completed",
};

const statusBadgeColors = {
  forming: { bg: '#DBEAFE', color: '#1E40AF' },
  approvals_complete: { bg: '#D1FAE5', color: '#065F46' },
  documents_gathering: { bg: '#EDE9FE', color: '#5B21B6' },
  active: { bg: '#D1FAE5', color: '#065F46' },
  completed: { bg: '#E5E7EB', color: '#374151' },
  closed: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function GroupStagesView() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: allGroups = [], isLoading } = useQuery({
    queryKey: ['partnership-groups'],
    queryFn: () => base44.entities.PartnershipGroup.list(),
  });

  const { data: allIntents = [] } = useQuery({
    queryKey: ['all-partnership-intents'],
    queryFn: () => base44.entities.PartnershipIntent.list(),
  });

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#D8A11F' }} />
        <p style={{ color: '#666' }}>Loading groups...</p>
      </div>
    );
  }

  if (allGroups.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}>
        <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#ccc' }} />
        <p className="text-lg font-semibold" style={{ color: '#000' }}>No partnership groups yet</p>
        <p className="text-sm mt-1" style={{ color: '#666' }}>Groups are created when users express interest in opportunities</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allGroups.map((group, index) => (
          <GroupStageCard
            key={group.id}
            group={group}
            index={index}
            intents={allIntents.filter(i => i.group_id === group.id)}
            onViewDetails={() => setSelectedGroup(group)}
          />
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: '#192234', borderColor: 'rgba(255,255,255,0.2)' }}>
          {selectedGroup && (
            <GroupDetailContent
              group={selectedGroup}
              currentUser={currentUser}
              intents={allIntents.filter(i => i.group_id === selectedGroup.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function GroupStageCard({ group, index, intents, onViewDetails }) {
  const activeMembers = (group.members || []).filter(m => m.status === 'active').length;
  const maxMembers = group.max_members || 20;
  const fillPercent = maxMembers > 0 ? Math.round((activeMembers / maxMembers) * 100) : 0;
  const mappedStatus = groupStatusToIntentStatus[group.status] || 'group_forming';
  const currentStatusIdx = statusOrder.indexOf(mappedStatus);
  const progress = currentStatusIdx >= 0 ? ((currentStatusIdx + 1) / statusOrder.length) * 100 : 12;
  const badgeColor = statusBadgeColors[group.status] || statusBadgeColors.forming;

  const progressLabel = group.status === 'completed' ? 'Partnership Completed' :
    group.status === 'active' ? 'Partnership Active' :
    group.status === 'documents_gathering' ? 'Documents Gathering' :
    group.status === 'approvals_complete' ? 'Approvals Complete' :
    'Group Forming';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
      style={{ border: '1px solid #E5E7EB' }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1 mr-2">
            {group.opportunity_name || group.name}
          </h3>
          <span className="px-3 py-1 rounded-md text-xs font-bold flex-shrink-0 capitalize"
            style={{ background: badgeColor.bg, color: badgeColor.color }}>
            {group.status?.replace(/_/g, ' ')}
          </span>
        </div>

        {group.opportunity_description && (
          <div className="flex items-start gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
            <p className="text-sm text-gray-500 line-clamp-1">{group.opportunity_description.substring(0, 80)}</p>
          </div>
        )}

        {/* Members + Docs row */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{activeMembers}/{maxMembers} members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{(group.documents || []).length} docs</span>
          </div>
          {(group.pending_members || []).length > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" style={{ color: '#F59E0B' }} />
              <span style={{ color: '#F59E0B' }}>{group.pending_members.length} pending</span>
            </div>
          )}
        </div>

        <Button
          onClick={onViewDetails}
          className="w-full rounded-lg py-2.5 text-sm font-semibold gap-2"
          style={{ background: '#14B8A6', color: '#fff' }}
        >
          <Eye className="w-4 h-4" />
          View Details & Manage
        </Button>
      </div>

      {/* Progress Section */}
      <div className="px-5 pb-4">
        <div className="pt-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D8A11F' }}>
              {progressLabel}
            </span>
            <span className="text-xs font-bold" style={{ color: '#14B8A6' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3B82F6, #14B8A6)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {statusOrder.map((status, idx) => {
              const isComplete = currentStatusIdx >= idx;
              return (
                <div key={status} className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                  ) : (
                    <Circle className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" />
                  )}
                  <span className={`text-xs ${isComplete ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {statusLabels[status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GroupDetailContent({ group, currentUser, intents }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-bold" style={{ color: '#E5EDFF' }}>
          {group.name}
        </DialogTitle>
        <DialogDescription style={{ color: '#B6C4E0' }}>
          {group.opportunity_name}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        {/* Status */}
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#B6C4E0' }}>Group Status</p>
          <p className="font-bold capitalize" style={{ color: '#D8A11F' }}>{group.status?.replace(/_/g, ' ')}</p>
        </div>

        {/* Members */}
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold" style={{ color: '#E5EDFF' }}>Active Members</p>
            <span className="text-sm" style={{ color: '#B6C4E0' }}>
              {group.members?.filter(m => m.status === 'active').length || 0}/{group.max_members || 20}
            </span>
          </div>
          <div className="space-y-2">
            {group.members?.filter(m => m.status === 'active').map((member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#D8A11F', color: '#fff' }}>
                  {(member.name || member.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{member.name || member.email}</p>
                  <p className="text-xs" style={{ color: '#7A8BA6' }}>Joined {new Date(member.joined_date).toLocaleDateString()}</p>
                </div>
                {member.email === group.creator_email && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded" style={{ background: '#D8A11F', color: '#fff' }}>Creator</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending members */}
        {group.pending_members?.length > 0 && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="font-semibold mb-3" style={{ color: '#E5EDFF' }}>Pending Members ({group.pending_members.length})</p>
            <div className="space-y-2">
              {group.pending_members.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Clock className="w-4 h-4" style={{ color: '#F59E0B' }} />
                  <p className="text-sm" style={{ color: '#B6C4E0' }}>{member.name || member.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <DocumentUploadSection group={group} currentUser={currentUser} />

        {/* Notes */}
        {group.notes && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="font-semibold mb-2" style={{ color: '#E5EDFF' }}>Notes</p>
            <p className="text-sm" style={{ color: '#B6C4E0' }}>{group.notes}</p>
          </div>
        )}

        {/* Stage Advancement */}
        <StageAdvancementControls
          group={group}
          currentUser={currentUser}
          intents={intents}
        />

        {/* Member Intent Status History */}
        {intents.length > 0 && (
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="font-semibold mb-3" style={{ color: '#E5EDFF' }}>Member Intents ({intents.length})</p>
            <div className="space-y-2">
              {intents.map((intent, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#E5EDFF' }}>{intent.user_name || intent.user_email}</p>
                    <p className="text-xs capitalize" style={{ color: '#7A8BA6' }}>{intent.current_status?.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded capitalize"
                    style={{ background: 'rgba(216, 161, 31, 0.15)', color: '#D8A11F' }}>
                    {intent.current_status?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}