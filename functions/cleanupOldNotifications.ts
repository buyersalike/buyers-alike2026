import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allNotifications = await base44.asServiceRole.entities.Notification.list();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldNotifications = allNotifications.filter(n => 
      new Date(n.created_date) < thirtyDaysAgo
    );

    let deleted = 0;
    for (const notification of oldNotifications) {
      await base44.asServiceRole.entities.Notification.delete(notification.id);
      deleted++;
    }

    return Response.json({ 
      success: true, 
      deleted,
      message: `Deleted ${deleted} notifications older than 30 days`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});