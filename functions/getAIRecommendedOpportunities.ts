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

    // Fetch user's profile data and interests in parallel
    const [userProfile, interests, partnershipIntents, dbOpportunities, realEstateCaches, franchiseCaches] = await Promise.all([
      base44.entities.User.filter({ email: user.email }),
      base44.entities.Interest.filter({ user_email: user.email, status: 'approved' }),
      base44.entities.PartnershipIntent.filter({ user_email: user.email }),
      base44.entities.Opportunity.list(),
      base44.entities.RealEstateCache.list('-created_date', 1),
      base44.entities.FranchiseCache.list('-created_date', 1),
    ]);

    const userData = userProfile[0] || {};

    // Combine all opportunity sources
    const realEstateOpps = (realEstateCaches[0]?.opportunities || []).map(opp => ({
      id: opp.id || `re_${Math.random().toString(36).substr(2, 9)}`,
      title: opp.title,
      description: opp.description,
      category: opp.type || 'Real Estate',
      investment: opp.investment,
      image_url: opp.image,
      source: 'real_estate',
    }));

    const franchiseOpps = (franchiseCaches[0]?.opportunities || []).map(opp => ({
      id: opp.id || `fr_${Math.random().toString(36).substr(2, 9)}`,
      title: opp.title,
      description: opp.description,
      category: 'Franchise',
      investment: opp.investment,
      image_url: opp.image,
      source: 'franchise',
    }));

    const dbOpps = dbOpportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      description: opp.description,
      category: opp.category,
      investment: `$${opp.investment_min || 0} - $${opp.investment_max || 0}`,
      related_interests: opp.related_interests || [],
      image_url: opp.image_url,
      source: 'db',
    }));

    const allOpportunities = [...dbOpps, ...realEstateOpps, ...franchiseOpps];

    if (allOpportunities.length === 0) {
      return Response.json({ success: false, error: 'No opportunities available to match against.' });
    }

    // Build user context
    const userContext = {
      name: user.full_name,
      bio: userData.bio || '',
      title: userData.title || '',
      location: userData.location || '',
      profession: userData.profession || '',
      skills: userData.skills || [],
      interests: interests.map(i => i.interest_name),
      pastPartnerships: partnershipIntents.map(p => ({
        opportunity: p.opportunity_name,
        status: p.current_status
      })),
    };

    const aiPrompt = `You are an expert business partnership matchmaker. Analyze the user's profile and recommend the TOP 6 most relevant opportunities from the list provided.

USER PROFILE:
${JSON.stringify(userContext, null, 2)}

AVAILABLE OPPORTUNITIES (pick the best matches):
${JSON.stringify(allOpportunities.slice(0, 80).map((o, idx) => ({
  index: idx,
  id: o.id,
  title: o.title,
  description: (o.description || '').substring(0, 200),
  category: o.category,
  investment: o.investment,
  related_interests: o.related_interests,
  source: o.source,
})), null, 2)}

For each recommended opportunity, provide:
1. The opportunity index (from the list above)
2. A match score (0-100) based on alignment with user's interests, profession, skills, location, and intent
3. A brief explanation (1-2 sentences) of WHY this is a good match

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "opportunity_index": number,
      "match_score": number,
      "match_reason": "string"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional partnership matchmaking AI. Always return valid JSON." },
        { role: "user", content: aiPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const aiResult = JSON.parse(response.choices[0].message.content);

    // Enrich recommendations with full opportunity data
    const enrichedRecommendations = (aiResult.recommendations || [])
      .map(rec => {
        const opportunity = allOpportunities[rec.opportunity_index];
        if (!opportunity) return null;
        return {
          ...opportunity,
          match_score: rec.match_score,
          match_reason: rec.match_reason,
          ai_recommended: true
        };
      })
      .filter(Boolean)
      .slice(0, 6);

    return Response.json({
      success: true,
      recommendations: enrichedRecommendations,
      total: enrichedRecommendations.length
    });

  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});