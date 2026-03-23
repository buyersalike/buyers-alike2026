import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, type, title, message, link, sendEmail } = await req.json();

    if (!recipientEmail || !type || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get recipient's notification preferences
    const recipients = await base44.entities.User.filter({ email: recipientEmail });
    const recipient = recipients[0];

    if (!recipient) {
      return Response.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if user has this notification type enabled
    const prefKey = type.replace(/_/g, '_');
    const notificationPrefs = recipient.notification_preferences || {};
    const isEnabled = notificationPrefs[prefKey] !== false;

    if (!isEnabled) {
      return Response.json({ 
        success: true, 
        message: 'Notification skipped - user has disabled this type' 
      });
    }

    // Create in-app notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      recipient_email: recipientEmail,
      type,
      title,
      message,
      link: link || null,
      sender_email: user.email,
      sender_name: user.full_name || user.email.split('@')[0],
      read: false,
      email_sent: false
    });

    // Send email notification if requested and user has email notifications enabled
    if (sendEmail && recipient.email_notifications !== false) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: title,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1F3A8A;">${title}</h2>
              <p style="color: #333; line-height: 1.6;">${message}</p>
              ${link ? `<a href="${link}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px;">View Details</a>` : ''}
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
              <p style="color: #666; font-size: 12px;">You received this email because you have email notifications enabled. You can change your notification preferences in Settings.</p>
            </div>
          `
        });

        await base44.asServiceRole.entities.Notification.update(notification.id, {
          email_sent: true
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    return Response.json({ 
      success: true, 
      notification 
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});