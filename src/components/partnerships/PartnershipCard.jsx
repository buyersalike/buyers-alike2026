import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Users, Eye, LogOut, CheckCircle2, Circle, UserPlus, 
  ExternalLink, MapPin, Home, Ruler, BedDouble, Target
} from "lucide-react";

const statusOrder = [
  "intent_created",
  "pending_group_join",
  "accepted_into_group",
  "group_forming",
  "approvals_complete",
  "documents_gathering",
  "partnership_active",
  "partnership_completed"
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

const statusBadgeColors = {
  intent_created: { bg: '#FEF3C7', color: '#92400E' },
  pending_group_join: { bg: '#FEF3C7', color: '#92400E' },
  accepted_into_group: { bg: '#D1FAE5', color: '#065F46' },
  approvals_complete: { bg: '#D1FAE5', color: '#065F46' },
  group_forming: { bg: '#DBEAFE', color: '#1E40AF' },
  documents_gathering: { bg: '#EDE9FE', color: '#5B21B6' },
  partnership_active: { bg: '#D1FAE5', color: '#065F46' },
  partnership_completed: { bg: '#FEF3C7', color: '#92400E' },
  withdrawn: { bg: '#FEE2E2', color: '#991B1B' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function PartnershipCard({ intent, group, mode, index, onViewDetails, onLeave, onJoin, leavePending }) {
  const currentStatus = intent?.current_status || 'intent_created';
  const currentStatusIdx = statusOrder.indexOf(currentStatus);
  const progress = currentStatusIdx >= 0 ? ((currentStatusIdx + 1) / statusOrder.length) * 100 : 12;

  const title = intent?.opportunity_name || group?.opportunity_name || "Partnership";
  const description = intent?.opportunity_description || group?.opportunity_description || "";
  const groupName = group?.name || intent?.group_name || "";
  const groupIntent = group?.group_intent || "";
  const activeMembers = group?.members?.filter(m => m.status === 'active').length ?? 0;
  const maxMembers = group?.max_members ?? 20;
  const fillPercent = maxMembers > 0 ? Math.round((activeMembers / maxMembers) * 100) : 0;
  const imageUrl = group?.opportunity_image || null;
  const investmentAmount = group?.opportunity_investment || "";
  const opportunityType = group?.opportunity_type || "";
  const opportunityLink = group?.opportunity_link || "";

  const badgeColor = statusBadgeColors[currentStatus] || statusBadgeColors['intent_created'];

  const progressLabel = currentStatus === 'partnership_completed' ? 'Partnership Completed' :
    currentStatus === 'partnership_active' ? 'Partnership Active' :
    currentStatus === 'documents_gathering' ? 'Documents Gathering' :
    currentStatus === 'group_forming' ? 'Group Forming' :
    currentStatus === 'approvals_complete' ? 'Approvals Complete' :
    currentStatus === 'accepted_into_group' ? 'Group Forming' :
    'Getting Started';

  const canLeave = mode !== 'completed' && mode !== 'declined' && !['partnership_completed', 'withdrawn', 'rejected'].includes(currentStatus);

  // Extract location-like info from description
  const extractDetail = (text, pattern) => {
    if (!text) return null;
    const match = text.match(pattern);
    return match ? match[0] : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
      style={{ border: '1px solid #E5E7EB' }}
    >
      {/* Image Section with Status Badge */}
      <div className="relative h-52 bg-gray-200">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Home className="w-16 h-16 text-white/40" />
          </div>
        )}
        {/* Status Badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className="px-3 py-1.5 rounded-md text-xs font-bold"
            style={{ background: badgeColor.bg, color: badgeColor.color }}
          >
            {statusLabels[currentStatus] || currentStatus?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Property Info */}
      <div className="px-5 pt-4 pb-3">
        {opportunityType && (
          <div className="flex items-center gap-1.5 mb-2">
            <Home className="w-3.5 h-3.5" style={{ color: '#D8A11F' }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D8A11F' }}>
              {opportunityType}
            </span>
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{title}</h3>
        {description && (
          <div className="flex items-start gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
            <p className="text-sm text-gray-500 line-clamp-1">{description.substring(0, 80)}</p>
          </div>
        )}

        {/* Investment Amount Display */}
        {investmentAmount && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{investmentAmount}</span>
          </div>
        )}
      </div>

      {/* Group Details Card */}
      <div className="mx-4 mb-3 p-4 rounded-xl" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{groupName || 'Partnership Group'}</h4>
            {groupIntent && (
              <p className="text-xs font-semibold uppercase tracking-wide mt-0.5" style={{ color: '#D8A11F' }}>
                {groupIntent.substring(0, 60)}
              </p>
            )}
          </div>
          {opportunityLink && (
            <a href={opportunityLink.startsWith('http') ? opportunityLink : `https://${opportunityLink}`}
              target="_blank" rel="noopener noreferrer"
              className="ml-2 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#D8A11F' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
          )}
        </div>

        {description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description.substring(0, 150)}</p>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <MetricBox label="MIN. BUY-IN" value={investmentAmount || 'TBD'} />
          <MetricBox label="TARGET IRR" value="10-15%" />
          <MetricBox label="HOLD PERIOD" value="5 years" />
          <MetricBox label="DISTRIBUTIONS" value="Quarterly" />
        </div>

        {/* Bottom row: type + members */}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #FDE68A' }}>
          <span className="text-xs text-gray-600">
            {opportunityType || 'Partnership'} — {groupName ? groupName.split(' ').slice(-1)[0] : 'Group'}
          </span>
          <span className="text-xs text-gray-500">
            {activeMembers}/{maxMembers} members · {fillPercent}% filled
          </span>
        </div>
        {/* Fill bar */}
        <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${fillPercent}%`, background: '#3B82F6' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          {mode === 'available' ? (
            <>
              {onViewDetails && (
                <Button
                  onClick={onViewDetails}
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold gap-2"
                  style={{ background: '#14B8A6', color: '#fff' }}
                >
                  <Eye className="w-4 h-4" />
                  View Group
                </Button>
              )}
              {onJoin && (
                <Button
                  onClick={onJoin}
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold gap-2"
                  style={{ background: '#F59E0B', color: '#fff' }}
                >
                  <UserPlus className="w-4 h-4" />
                  Join
                </Button>
              )}
            </>
          ) : (
            <>
              {group && onViewDetails && (
                <Button
                  onClick={onViewDetails}
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold gap-2"
                  style={{ background: '#14B8A6', color: '#fff' }}
                >
                  <Eye className="w-4 h-4" />
                  View Group
                </Button>
              )}
              {canLeave && onLeave && (
                <Button
                  onClick={onLeave}
                  disabled={leavePending}
                  variant="outline"
                  className="flex-1 rounded-lg py-2.5 text-sm font-semibold gap-2"
                  style={{ borderColor: '#FCA5A5', color: '#EF4444' }}
                >
                  <LogOut className="w-4 h-4" />
                  {leavePending ? 'Leaving...' : 'Leave'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-4 pb-4">
        <div className="pt-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#D8A11F' }}>
              {progressLabel}
            </span>
            <span className="text-xs font-bold" style={{ color: '#14B8A6' }}>{Math.round(progress)}%</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #3B82F6, #14B8A6)' }}
            />
          </div>
          {/* Stage Checklist */}
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

function MetricBox({ label, value }) {
  return (
    <div className="px-3 py-2 rounded-lg" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
      <span className="text-[10px] font-bold uppercase tracking-wide block mb-0.5" style={{ color: '#DC2626' }}>
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}