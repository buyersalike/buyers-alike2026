import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return Response.json({ error: 'Opportunity ID required' }, { status: 400 });
    }

    // Get the opportunity
    const opportunity = await base44.asServiceRole.entities.Opportunity.filter({ id: opportunityId });
    if (!opportunity || opportunity.length === 0) {
      return Response.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const opp = opportunity[0];

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    // Get all user interests
    const interests = await base44.asServiceRole.entities.Interest.list();

    const notificationsSent = [];

    // Check each user for matching interests
    for (const targetUser of users) {
      // Skip the opportunity creator
      if (targetUser.email === opp.creator_email) continue;

      // Get user's interests
      const userInterests = interests.filter(i => i.user_email === targetUser.email);
      
      // Check if opportunity matches any user interest
      let hasMatch = false;

      // Match by category
      const categoryInterest = userInterests.find(i => 
        i.category && opp.category && i.category.toLowerCase().includes(opp.category.toLowerCase())
      );
      if (categoryInterest) hasMatch = true;

      // Match by related interests
      if (opp.related_interests && opp.related_interests.length > 0) {
        const matchingInterest = userInterests.find(i => 
          opp.related_interests.some(relInt => 
            i.name && relInt.toLowerCase().includes(i.name.toLowerCase())
          )
        );
        if (matchingInterest) hasMatch = true;
      }

      // If match found, send notification
      if (hasMatch) {
        try {
          const response = await base44.functions.invoke('sendNotification', {
            recipientEmail: targetUser.email,
            type: 'opportunity_match',
            title: '🎯 New Opportunity Matches Your Interests!',
            message: `A new ${opp.category} opportunity has been posted: ${opp.title}`,
            link: `/Opportunities?highlight=${opp.id}`,
            sendEmail: true
          });

          notificationsSent.push({
            email: targetUser.email,
            success: response.data?.success || false
          });
        } catch (error) {
          console.error(`Failed to notify ${targetUser.email}:`, error);
        }
      }
    }

    return Response.json({ 
      success: true,
      notificationsSent: notificationsSent.length,
      details: notificationsSent
    });

  } catch (error) {
    console.error('Check opportunity matches error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});