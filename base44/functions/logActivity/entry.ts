import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Maps entity names to readable labels
const ENTITY_LABELS = {
  Interest: 'Interest',
  Opportunity: 'Opportunity',
  Connection: 'Connection',
  PartnershipGroup: 'Partnership Group',
  PartnershipIntent: 'Partnership Intent',
  VendorApplication: 'Vendor Application',
  AdvertiseApplication: 'Ad Campaign',
  ForumPost: 'Forum Post',
  ForumComment: 'Forum Comment',
  ContactSubmission: 'Contact Submission',
  User: 'User',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    const entityLabel = ENTITY_LABELS[event.entity_name] || event.entity_name;

    let type = `${event.entity_name.toLowerCase()}_${event.type}d`;
    let message = '';

    // Build human-readable messages per entity type
    if (event.entity_name === 'Interest') {
      if (event.type === 'create') {
        message = `New interest "${data?.interest_name || 'Unknown'}" submitted by ${data?.user_email || 'Unknown'}`;
        type = 'interest_created';
      } else if (event.type === 'update') {
        if (data?.status !== old_data?.status) {
          message = `Interest "${data?.interest_name}" status changed to ${data?.status}`;
          type = `interest_${data?.status}`;
        } else {
          message = `Interest "${data?.interest_name}" updated`;
          type = 'interest_updated';
        }
      } else if (event.type === 'delete') {
        message = `Interest deleted`;
        type = 'interest_deleted';
      }
    } else if (event.entity_name === 'Opportunity') {
      if (event.type === 'create') {
        message = `New opportunity "${data?.title || 'Unknown'}" created`;
        type = 'opportunity_created';
      } else if (event.type === 'update') {
        message = `Opportunity "${data?.title}" updated (status: ${data?.status})`;
        type = 'opportunity_updated';
      } else if (event.type === 'delete') {
        message = `Opportunity deleted`;
        type = 'opportunity_deleted';
      }
    } else if (event.entity_name === 'Connection') {
      if (event.type === 'create') {
        message = `Connection request from ${data?.user1_email} to ${data?.user2_email}`;
        type = 'connection_created';
      } else if (event.type === 'update' && data?.status === 'connected') {
        message = `${data?.user1_email} and ${data?.user2_email} are now connected`;
        type = 'connection_established';
      }
    } else if (event.entity_name === 'PartnershipGroup') {
      if (event.type === 'create') {
        message = `Partnership group "${data?.name}" formed for "${data?.opportunity_name}"`;
        type = 'partnership_group_created';
      } else if (event.type === 'update') {
        message = `Partnership group "${data?.name}" status: ${data?.status}`;
        type = 'partnership_updated';
      }
    } else if (event.entity_name === 'VendorApplication') {
      if (event.type === 'create') {
        message = `Vendor application from "${data?.business_name}" (${data?.user_email})`;
        type = 'vendor_application';
      } else if (event.type === 'update' && data?.status !== old_data?.status) {
        message = `Vendor "${data?.business_name}" ${data?.status}`;
        type = `vendor_${data?.status}`;
      }
    } else if (event.entity_name === 'AdvertiseApplication') {
      if (event.type === 'create') {
        message = `Ad campaign application from "${data?.business_name}"`;
        type = 'ad_campaign_created';
      } else if (event.type === 'update' && data?.status !== old_data?.status) {
        message = `Ad campaign "${data?.business_name}" ${data?.status}`;
        type = `ad_campaign_${data?.status}`;
      }
    } else if (event.entity_name === 'ForumPost') {
      if (event.type === 'create') {
        message = `New forum post "${data?.title}" by ${data?.author_email}`;
        type = 'forum_post_created';
      }
    } else if (event.entity_name === 'ContactSubmission') {
      if (event.type === 'create') {
        message = `New contact submission from ${data?.name} (${data?.email}): ${data?.subject}`;
        type = 'contact_submitted';
      }
    } else {
      // Generic fallback
      message = `${entityLabel} ${event.type}d`;
    }

    if (!message) {
      return Response.json({ skipped: true });
    }

    await base44.asServiceRole.entities.SystemLog.create({
      type,
      message,
      entity_type: event.entity_name,
      entity_id: event.entity_id,
      user_email: data?.user_email || data?.creator_email || data?.author_email || data?.created_by || null,
      user_name: data?.user_name || data?.author_name || null,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});