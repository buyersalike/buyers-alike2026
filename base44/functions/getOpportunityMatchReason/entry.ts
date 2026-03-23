import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return Response.json({ error: 'opportunityId is required' }, { status: 400 });
    }

    // Fetch user's profile data
    const userProfile = await base44.entities.User.filter({ email: user.email });
    const userData = userProfile[0] || {};

    // Fetch user's interests
    const interests = await base44.entities.Interest.filter({ user_email: user.email });

    // Fetch user's partnership intents
    const partnershipIntents = await base44.entities.PartnershipIntent.filter({ user_email: user.email });

    // Fetch the specific opportunity
    const opportunities = await base44.entities.Opportunity.filter({ id: opportunityId });
    const opportunity = opportunities[0];

    if (!opportunity) {
      return Response.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Build user context
    const userContext = {
      name: user.full_name,
      bio: userData.bio || '',
      title: userData.title || '',
      location: userData.location || '',
      interests: interests.map(i => i.interest_name),
      pastPartnerships: partnershipIntents.map(p => ({
        opportunity: p.opportunity_name,
        status: p.current_status
      })),
      profession: userData.profession || '',
      skills: userData.skills || []
    };

    // Use AI to explain the match
    const aiPrompt = `You are an expert partnership matchmaker. Analyze why this opportunity is a good match for the user.

USER PROFILE:
${JSON.stringify(userContext, null, 2)}

OPPORTUNITY:
Title: ${opportunity.title}
Description: ${opportunity.description}
Category: ${opportunity.category}
Investment Range: $${opportunity.investment_min || 0} - $${opportunity.investment_max || 'N/A'}

Provide:
1. A match score (0-100)
2. A compelling explanation (3-4 sentences) of WHY this opportunity is a great match for this user
3. Key alignment factors (2-3 bullet points)

Return ONLY valid JSON in this exact format:
{
  "match_score": number,
  "match_explanation": "string",
  "alignment_factors": ["string", "string", "string"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional partnership matchmaking AI. Always return valid JSON."
        },
        {
          role: "user",
          content: aiPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const aiResult = JSON.parse(response.choices[0].message.content);

    return Response.json({
      success: true,
      ...aiResult
    });

  } catch (error) {
    console.error('Error generating match reason:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});