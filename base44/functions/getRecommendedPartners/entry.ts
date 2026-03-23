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

    // Fetch existing connections to exclude
    const connections = await base44.entities.Connection.filter({
      user1_email: user.email
    });
    const connections2 = await base44.entities.Connection.filter({
      user2_email: user.email
    });
    const connectedEmails = [
      ...connections.map(c => c.user2_email),
      ...connections2.map(c => c.user1_email)
    ];

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    const potentialPartners = allUsers.filter(u => 
      u.email !== user.email && !connectedEmails.includes(u.email)
    );

    // Create user profile summary
    const userProfile = {
      name: user.full_name,
      title: user.title,
      bio: user.bio,
      location: user.location,
      interests: interests.map(i => i.interest_name),
      occupation: user.occupation,
      business_name: user.business_name,
      state: user.state,
      country: user.country,
    };

    // Use AI to find compatible partners
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{
        role: 'user',
        content: `You are an expert business matchmaker specializing in strategic partnerships. Analyze this user's profile and recommend the top 5 most compatible potential partners who would benefit from a business connection.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Potential Partners (first 30):
${JSON.stringify(potentialPartners.slice(0, 30).map(u => ({
  email: u.email,
  name: u.full_name,
  title: u.title,
  bio: u.bio,
  location: u.location,
  occupation: u.occupation,
  business_name: u.business_name,
  state: u.state,
  country: u.country
})), null, 2)}

Focus on:
- Complementary skills and expertise
- Geographic proximity or strategic location advantages
- Aligned business interests and goals
- Potential for mutual value creation
- Industry synergies

Return the top 5 partner recommendations with detailed reasoning.`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    const aiRecommendations = JSON.parse(response.choices[0].message.content);

    // Enrich recommendations with full user data
    const enrichedRecommendations = aiRecommendations.recommendations.map(rec => ({
      ...rec,
      partner: potentialPartners.find(u => u.email === rec.partner_email)
    }));

    return Response.json({
      success: true,
      recommendations: enrichedRecommendations,
      total_potential_partners: potentialPartners.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});