import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Eye, LogOut, CheckCircle2, X, Clock, UserPlus, ExternalLink, Target, User } from "lucide-react";

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

const statusLabels = {
  intent_created: "Intent Created",
  pending_group_join: "Pending Group Join",
  accepted_into_group: "Accepted into Group",
  approvals_complete: "Approvals Complete",
  group_forming: "Group Forming",
  documents_gathering: "Document Gathering",
  partnership_active: "Partnership Active",
  partnership_completed: "Partnership Completed",
};

const statusBadgeStyle = {
  intent_created: { background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' },
  pending_group_join: { background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' },
  accepted_into_group: { background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' },
  approvals_complete: { background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' },
  group_forming: { background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' },
  documents_gathering: { background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)' },
  partnership_active: { background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' },
  partnership_completed: { background: 'rgba(216, 161, 31, 0.15)', color: '#D8A11F', border: '1px solid rgba(216, 161, 31, 0.3)' },
  withdrawn: { background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' },
  rejected: { background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' },
};

export default function PartnershipCard({ intent, group, mode, index, onViewDetails, onLeave, onJoin, leavePending }) {
  const currentStatus = intent?.current_status || 'intent_created';
  const currentStatusIdx = statusOrder.indexOf(currentStatus);
  const progress = currentStatusIdx >= 0 ? ((currentStatusIdx + 1) / statusOrder.length) * 100 : 12;

  const title = intent?.opportunity_name || group?.opportunity_name || "Partnership";
  const description = intent?.opportunity_description || group?.opportunity_description || "";
  const groupName = group?.name || intent?.group_name || "";
  const activeMembers = group?.members?.filter(m => m.status === 'active').length ?? 0;
  const maxMembers = group?.max_members ?? 20;

  const progressLabel = currentStatus === 'partnership_completed' ? 'Partnership Completed' :
    currentStatus === 'partnership_active' ? 'Partnership Active' :
    currentStatus === 'documents_gathering' ? 'Documents Gathering' :
    currentStatus === 'group_forming' ? 'Group Forming' :
    currentStatus === 'approvals_complete' ? 'Approvals Complete' :
    currentStatus === 'accepted_into_group' ? 'Group Forming' :
    'Getting Started';

  const badgeStyle = statusBadgeStyle[currentStatus] || statusBadgeStyle['intent_created'];

  const canLeave = mode !== 'completed' && mode !== 'declined' && !['partnership_completed', 'withdrawn', 'rejected'].includes(currentStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-1"
      style={{ background: '#0F2744', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)' }}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#E5EDFF' }}>
          {title}
        </h3>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-2" style={badgeStyle}>
          <CheckCircle2 className="w-3 h-3" />
          {statusLabels[currentStatus] || currentStatus?.replace(/_/g, ' ')}
        </div>
        {description && (
          <p className="text-sm line-clamp-2 mt-2" style={{ color: '#B6C4E0' }}>{description}</p>
        )}
      </div>

      {/* Group Info */}
      {groupName && (
        <div className="mb-4 p-3 rounded-lg space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm font-semibold truncate" style={{ color: '#E5EDFF' }}>
            Group: {groupName}
          </p>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: '#B6C4E0' }}>
            <Users className="w-4 h-4" />
            <span>Members: {activeMembers}/{maxMembers}</span>
          </div>

          {/* Group Intent - show for available mode */}
          {mode === 'available' && group?.group_intent && (
            <div className="flex items-start gap-1.5 text-xs" style={{ color: '#B6C4E0' }}>
              <Target className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#D8A11F' }} />
              <span className="line-clamp-2">{group.group_intent}</span>
            </div>
          )}

          {/* Opportunity Link */}
          {mode === 'available' && group?.opportunity_link && (
            <a href={group.opportunity_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs hover:underline"
              style={{ color: '#3B82F6' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">View Listing</span>
            </a>
          )}

          {/* Member Avatars */}
          {mode === 'available' && group?.members?.filter(m => m.status === 'active').length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {group.members.filter(m => m.status === 'active').slice(0, 6).map((m, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#B6C4E0' }}>
                  <User className="w-3 h-3" />
                  {(m.name || m.email.split('@')[0]).split(' ')[0]}
                </span>
              ))}
              {group.members.filter(m => m.status === 'active').length > 6 && (
                <span className="text-xs" style={{ color: '#7A8BA6' }}>+{group.members.filter(m => m.status === 'active').length - 6}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        {mode === 'available' ? (
          <>
            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
            )}
            {onJoin && (
              <Button
                onClick={onJoin}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: '#22C55E', color: '#fff' }}
              >
                <UserPlus className="w-4 h-4" />
                Request to Join
              </Button>
            )}
          </>
        ) : (
          <>
            {group && onViewDetails && (
              <Button
                onClick={onViewDetails}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#E5EDFF' }}
              >
                <Eye className="w-4 h-4" />
                View Group Details
              </Button>
            )}
            {canLeave && onLeave && (
              <Button
                onClick={onLeave}
                disabled={leavePending}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: '#EF4444', color: '#fff' }}
              >
                <LogOut className="w-4 h-4" />
                {leavePending ? 'Leaving...' : 'Leave Partnership'}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: '#FACC15' }}>{progressLabel}</span>
          <span className="text-xs" style={{ color: '#7A8BA6' }}>{Math.round(progress)}%</span>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FACC15 0%, #3B82F6 100%)' }}
          />
        </div>
      </div>

      {/* Stage Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {statusOrder.map((status, idx) => {
          const isComplete = currentStatusIdx >= idx;
          return (
            <div key={status} className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#3B82F6' }} />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" style={{ color: '#7A8BA6' }} />
              )}
              <span className="text-xs" style={{ color: isComplete ? '#B6C4E0' : '#7A8BA6' }}>
                {statusLabels[status]}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}