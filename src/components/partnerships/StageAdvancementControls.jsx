import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";

const GROUP_STATUS_ORDER = ["forming", "approvals_complete", "documents_gathering", "active", "completed"];
const GROUP_STATUS_LABELS = {
  forming: "Group Forming",
  approvals_complete: "Approvals Complete",
  documents_gathering: "Document Gathering",
  active: "Partnership Active",
  completed: "Partnership Completed"
};

const GROUP_TO_INTENT_STATUS = {
  forming: "group_forming",
  approvals_complete: "approvals_complete",
  documents_gathering: "documents_gathering",
  active: "partnership_active",
  completed: "partnership_completed"
};

export default function StageAdvancementControls({ group, currentUser, intents = [] }) {
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();

  const advanceMutation = useMutation({
    mutationFn: async () => {
      // Update group status
      await base44.entities.PartnershipGroup.update(group.id, { status: nextStatus });

      // Update all member intents to the corresponding intent status
      const targetIntentStatus = GROUP_TO_INTENT_STATUS[nextStatus];
      if (targetIntentStatus) {
        const groupIntents = intents.filter(i =>
          i.group_id === group.id &&
          !['withdrawn', 'rejected', 'partnership_completed'].includes(i.current_status)
        );
        for (const intent of groupIntents) {
          const statusHistory = [...(intent.status_history || []), {
            status: targetIntentStatus,
            timestamp: new Date().toISOString(),
            notes: `Stage manually advanced to "${GROUP_STATUS_LABELS[nextStatus]}" by ${isAdmin ? 'admin' : 'group creator'} (${currentUser.full_name || currentUser.email})`
          }];
          await base44.entities.PartnershipIntent.update(intent.id, {
            current_status: targetIntentStatus,
            status_history: statusHistory
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnership-groups'] });
      queryClient.invalidateQueries({ queryKey: ['partnership-intents'] });
      toast.success(`Group advanced to "${GROUP_STATUS_LABELS[nextStatus]}"`);
      setConfirming(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to advance stage");
      setConfirming(false);
    },
  });

  if (!group || !currentUser) return null;

  const isCreator = group.creator_email === currentUser.email;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';
  const canAdvance = isCreator || isAdmin;

  if (!canAdvance) return null;

  const currentIdx = GROUP_STATUS_ORDER.indexOf(group.status);
  const nextStatus = currentIdx >= 0 && currentIdx < GROUP_STATUS_ORDER.length - 1
    ? GROUP_STATUS_ORDER[currentIdx + 1]
    : null;

  if (!nextStatus) return null;

  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(216, 161, 31, 0.1)', border: '1px solid rgba(216, 161, 31, 0.3)' }}>
      <div className="flex items-center gap-2 mb-3">
        <ChevronRight className="w-4 h-4" style={{ color: '#D8A11F' }} />
        <p className="text-sm font-semibold" style={{ color: '#E5EDFF' }}>Advance Stage</p>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(216, 161, 31, 0.2)', color: '#D8A11F' }}>
          {isAdmin ? 'Admin' : 'Creator'}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.1)', color: '#B6C4E0' }}>
          {GROUP_STATUS_LABELS[group.status] || group.status}
        </span>
        <ChevronRight className="w-3 h-3" style={{ color: '#7A8BA6' }} />
        <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}>
          {GROUP_STATUS_LABELS[nextStatus]}
        </span>
      </div>

      {!confirming ? (
        <Button
          onClick={() => setConfirming(true)}
          className="w-full rounded-lg text-sm font-semibold"
          style={{ background: '#D8A11F', color: '#fff' }}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Advance to {GROUP_STATUS_LABELS[nextStatus]}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
            <p className="text-xs" style={{ color: '#B6C4E0' }}>
              This will advance the group and update all member statuses. Are you sure?
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => advanceMutation.mutate()}
              disabled={advanceMutation.isPending}
              className="flex-1 rounded-lg text-sm"
              style={{ background: '#22C55E', color: '#fff' }}
            >
              {advanceMutation.isPending ? 'Advancing...' : 'Confirm'}
            </Button>
            <Button
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg text-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}