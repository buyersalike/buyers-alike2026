import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

// Ordered list of statuses for progression comparison
const STATUS_ORDER = [
  'intent_created',
  'pending_group_join',
  'accepted_into_group',
  'group_forming',
  'approvals_complete',
  'documents_gathering',
  'partnership_active',
  'partnership_completed'
];

// Map group status → intent status
const GROUP_TO_INTENT_STATUS = {
  'forming': 'group_forming',
  'approvals_complete': 'approvals_complete',
  'documents_gathering': 'documents_gathering',
  'active': 'partnership_active',
  'completed': 'partnership_completed'
};

function statusRank(status) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function buildNote(reason, details = {}) {
  const parts = [reason];
  if (details.members !== undefined) parts.push(`Members: ${details.members}`);
  if (details.documents !== undefined) parts.push(`Documents submitted: ${details.documents}`);
  if (details.pending !== undefined) parts.push(`Pending approvals: ${details.pending}`);
  if (details.aiInsight) parts.push(`AI insight: ${details.aiInsight}`);
  return parts.join(' | ');
}

async function getAIInsight(group, intents, trigger) {
  try {
    const context = {
      groupName: group.name,
      opportunityName: group.opportunity_name,
      memberCount: group.members?.filter(m => m.status === 'active').length || 0,
      documentsUploaded: group.documents?.length || 0,
      pendingCount: group.pending_members?.length || 0,
      trigger
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a partnership advisor. Generate a single concise sentence (max 20 words) describing why this stage transition is happening. Be specific and actionable."
        },
        {
          role: "user",
          content: `Partnership group "${context.groupName}" for opportunity "${context.opportunityName}" is advancing because: ${context.trigger}. Members: ${context.memberCount}, Documents: ${context.documentsUploaded}, Pending: ${context.pendingCount}.`
        }
      ],
      max_tokens: 60
    });

    return response.choices[0].message.content.trim();
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const groups = await base44.asServiceRole.entities.PartnershipGroup.list();
    const updatedIntents = [];
    const updatedGroups = [];

    for (const group of groups) {
      if (group.status === 'completed' || group.status === 'closed') continue;

      const activeMembers = (group.members || []).filter(m => m.status === 'active');
      const pendingMembers = group.pending_members || [];
      const documents = group.documents || [];
      const activeMemberEmails = new Set(activeMembers.map(m => m.email));

      let newGroupStatus = group.status;
      let groupTransitionTrigger = null;

      // --- GROUP STAGE RULES ---

      // Rule G1: pending_group_join → forming: No more pending members and ≥2 active
      if (group.status === 'forming' && pendingMembers.length === 0 && activeMembers.length >= 2) {
        newGroupStatus = 'approvals_complete';
        groupTransitionTrigger = `All pending members accepted; ${activeMembers.length} active members confirmed`;
      }

      // Rule G2: approvals_complete → documents_gathering (immediate)
      if ((newGroupStatus === 'approvals_complete' || group.status === 'approvals_complete') && activeMembers.length >= 2) {
        newGroupStatus = 'documents_gathering';
        groupTransitionTrigger = groupTransitionTrigger || `Approvals complete with ${activeMembers.length} members; moving to document collection`;
      }

      // Rule G3: documents_gathering → active: Every active member has uploaded at least one document
      if ((newGroupStatus === 'documents_gathering' || group.status === 'documents_gathering') && activeMembers.length >= 2) {
        const uploaderEmails = new Set(documents.map(d => d.uploaded_by));
        const allMembersUploaded = activeMembers.every(m => uploaderEmails.has(m.email));
        if (allMembersUploaded && documents.length > 0) {
          newGroupStatus = 'active';
          groupTransitionTrigger = `All ${activeMembers.length} members uploaded documents (${documents.length} total documents)`;
        }
      }

      const groupStatusChanged = newGroupStatus !== group.status;

      // Fetch AI insight for group transition
      let groupAiInsight = null;
      if (groupStatusChanged && groupTransitionTrigger) {
        groupAiInsight = await getAIInsight(group, [], groupTransitionTrigger);
      }

      if (groupStatusChanged) {
        await base44.asServiceRole.entities.PartnershipGroup.update(group.id, {
          status: newGroupStatus
        });
        updatedGroups.push({
          groupId: group.id,
          groupName: group.name,
          oldStatus: group.status,
          newStatus: newGroupStatus,
          trigger: groupTransitionTrigger,
          aiInsight: groupAiInsight
        });
      }

      // --- INTENT STAGE RULES ---

      const intents = await base44.asServiceRole.entities.PartnershipIntent.filter({ group_id: group.id });

      for (const intent of intents) {
        if (intent.current_status === 'partnership_completed' || intent.current_status === 'rejected' || intent.current_status === 'withdrawn') continue;

        let newIntentStatus = intent.current_status;
        let intentTrigger = null;

        // Rule I1: Auto-accept pending member when they are found as active in group
        if (intent.current_status === 'pending_group_join' && activeMemberEmails.has(intent.user_email)) {
          newIntentStatus = 'accepted_into_group';
          intentTrigger = `User ${intent.user_name || intent.user_email} accepted into group by an admin or auto-approved`;
        }

        // Rule I2: Move pending member to active if they're the only one waiting and group has ≤3 active
        if (intent.current_status === 'pending_group_join' && pendingMembers.length === 1 && activeMembers.length < 3) {
          const pendingEntry = pendingMembers.find(m => m.email === intent.user_email);
          if (pendingEntry) {
            const updatedPending = pendingMembers.filter(m => m.email !== intent.user_email);
            const updatedActive = [...activeMembers, {
              email: pendingEntry.email,
              name: pendingEntry.name,
              joined_date: new Date().toISOString(),
              status: 'active'
            }];
            await base44.asServiceRole.entities.PartnershipGroup.update(group.id, {
              members: updatedActive,
              pending_members: updatedPending
            });
            newIntentStatus = 'accepted_into_group';
            intentTrigger = `Only pending applicant; automatically accepted to form group with ${activeMembers.length + 1} members`;
          }
        }

        // Rule I3: accepted_into_group → group_forming when group has ≥3 members
        if ((newIntentStatus === 'accepted_into_group' || intent.current_status === 'accepted_into_group') && activeMembers.length >= 3) {
          if (statusRank('group_forming') > statusRank(newIntentStatus)) {
            newIntentStatus = 'group_forming';
            intentTrigger = intentTrigger || `Group reached ${activeMembers.length} active members — forming phase initiated`;
          }
        }

        // Rule I4: Sync with group status changes
        if (groupStatusChanged) {
          const targetIntentStatus = GROUP_TO_INTENT_STATUS[newGroupStatus];
          if (targetIntentStatus && statusRank(targetIntentStatus) > statusRank(newIntentStatus)) {
            newIntentStatus = targetIntentStatus;
            intentTrigger = intentTrigger || `Group advanced to "${newGroupStatus}" — syncing member intent`;
          }
        }

        // Rule I5: documents_gathering — check if this specific member uploaded their documents
        if ((newIntentStatus === 'documents_gathering' || intent.current_status === 'documents_gathering')) {
          const memberDocs = documents.filter(d => d.uploaded_by === intent.user_email);
          if (memberDocs.length > 0 && newIntentStatus === 'documents_gathering') {
            // Member uploaded docs; check if all have now uploaded to push to partnership_active
            const uploaderEmails = new Set(documents.map(d => d.uploaded_by));
            const allUploaded = activeMembers.every(m => uploaderEmails.has(m.email));
            if (allUploaded) {
              newIntentStatus = 'partnership_active';
              intentTrigger = intentTrigger || `All members completed document submission (${memberDocs.length} docs by this member)`;
            }
          }
        }

        const intentStatusChanged = newIntentStatus !== intent.current_status;

        if (intentStatusChanged) {
          // Get AI insight for this intent transition
          const aiInsight = await getAIInsight(group, intents, intentTrigger);

          const statusHistory = Array.isArray(intent.status_history) ? [...intent.status_history] : [];
          statusHistory.push({
            status: newIntentStatus,
            timestamp: new Date().toISOString(),
            notes: buildNote(intentTrigger, {
              members: activeMembers.length,
              documents: documents.length,
              pending: pendingMembers.length,
              aiInsight
            })
          });

          await base44.asServiceRole.entities.PartnershipIntent.update(intent.id, {
            current_status: newIntentStatus,
            status_history: statusHistory
          });

          updatedIntents.push({
            intentId: intent.id,
            userEmail: intent.user_email,
            userName: intent.user_name,
            opportunityName: intent.opportunity_name,
            oldStatus: intent.current_status,
            newStatus: newIntentStatus,
            trigger: intentTrigger,
            aiInsight
          });
        }
      }
    }

    return Response.json({
      success: true,
      message: `Advanced ${updatedIntents.length} intent(s) and ${updatedGroups.length} group(s)`,
      updatedIntents,
      updatedGroups,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in advancePartnershipStages:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});