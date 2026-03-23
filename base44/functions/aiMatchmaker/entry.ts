import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's interests
    const interests = await base44.entities.Interest.filter({ 
      user_email: user.email,
      status: 'approved'
    });

    // Fetch all opportunities
    const opportunities = await base44.asServiceRole.entities.Opportunity.list();

    // Fetch all users for partner matching
    const allUsers = await base44.asServiceRole.entities.User.list();
    const otherUsers = allUsers.filter(u => u.email !== user.email);

    // Create user profile summary
    const userProfile = {
      name: user.full_name,
      title: user.title,
      bio: user.bio,
      location: user.location,
      interests: interests.map(i => i.interest_name),
      occupation: user.occupation,
      business_name: user.business_name,
    };

    // Use AI to analyze and match opportunities
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const opportunityResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{
        role: 'user',
        content: `You are an expert business matchmaker. Analyze this user profile and the list of opportunities, then identify the top 5 most relevant matches.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Available Opportunities:
${JSON.stringify(opportunities.map(o => ({
  id: o.id,
  title: o.title,
  description: o.description,
  category: o.category,
  investment_range: o.investment_range,
  location: o.location
})), null, 2)}

Return the top 5 matches with confidence scores and explanations.`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    const opportunityMatches = JSON.parse(opportunityResponse.choices[0].message.content);

    // Use AI to find compatible partners
    const partnerResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{
        role: 'user',
        content: `You are an expert business matchmaker. Analyze this user profile and find the top 5 most compatible potential partners from the user list.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Potential Partners:
${JSON.stringify(otherUsers.map(u => ({
  email: u.email,
  name: u.full_name,
  title: u.title,
  bio: u.bio,
  location: u.location,
  occupation: u.occupation,
  business_name: u.business_name
})).slice(0, 50), null, 2)}

Return the top 5 partner matches with confidence scores and explanations.`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    const partnerMatches = JSON.parse(partnerResponse.choices[0].message.content);

    // Filter high-confidence matches (>70%)
    const highConfidenceOpportunities = opportunityMatches.matches
      .filter(m => m.confidence_score >= 0.7)
      .map(m => ({
        ...m,
        opportunity: opportunities.find(o => o.id === m.opportunity_id)
      }));

    const highConfidencePartners = partnerMatches.matches
      .filter(m => m.confidence_score >= 0.7)
      .map(m => ({
        ...m,
        partner: otherUsers.find(u => u.email === m.partner_email)
      }));

    // Create notifications for high-confidence matches
    if (highConfidenceOpportunities.length > 0) {
      const topOpp = highConfidenceOpportunities[0];
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: user.email,
        type: 'opportunity_match',
        title: '🎯 AI Found a Perfect Match!',
        message: `We found an excellent opportunity match for you: "${topOpp.opportunity.title}" (${Math.round(topOpp.confidence_score * 100)}% match)`,
        link: '/Opportunities',
        read: false,
        email_sent: false,
      });
    }

    if (highConfidencePartners.length > 0) {
      const topPartner = highConfidencePartners[0];
      await base44.asServiceRole.entities.Notification.create({
        recipient_email: user.email,
        type: 'connection_request',
        title: '🤝 AI Recommends a Connection!',
        message: `${topPartner.partner.full_name} is a ${Math.round(topPartner.confidence_score * 100)}% match for collaboration`,
        link: '/Recommendations',
        sender_email: topPartner.partner.email,
        sender_name: topPartner.partner.full_name,
        read: false,
        email_sent: false,
      });
    }

    return Response.json({
      success: true,
      opportunity_matches: opportunityMatches.matches,
      partner_matches: partnerMatches.matches,
      high_confidence_opportunities: highConfidenceOpportunities.length,
      high_confidence_partners: highConfidencePartners.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});