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

    const [userProfile, interests, partnershipIntents, dbOpportunities, realEstateCaches, franchiseCaches] = await Promise.all([
      base44.entities.User.filter({ email: user.email }),
      base44.entities.Interest.filter({ user_email: user.email, status: 'approved' }),
      base44.entities.PartnershipIntent.filter({ user_email: user.email }),
      base44.entities.Opportunity.list(),
      base44.entities.RealEstateCache.list('-created_date', 1),
      base44.entities.FranchiseCache.list('-created_date', 1),
    ]);

    const userData = userProfile[0] || {};

    const realEstateOpps = (realEstateCaches[0]?.opportunities || []).map(opp => ({
      id: opp.id || `re_${Math.random().toString(36).substr(2, 9)}`,
      title: opp.title,
      description: (opp.description || '').substring(0, 250),
      category: opp.type || 'Real Estate',
      investment: opp.investment,
      location: opp.location || opp.address || '',
      source: 'real_estate',
    }));

    const franchiseOpps = (franchiseCaches[0]?.opportunities || []).map(opp => ({
      id: opp.id || `fr_${Math.random().toString(36).substr(2, 9)}`,
      title: opp.title,
      description: (opp.description || '').substring(0, 250),
      category: 'Franchise',
      investment: opp.investment,
      location: opp.location || '',
      source: 'franchise',
    }));

    const dbOpps = dbOpportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      description: (opp.description || '').substring(0, 250),
      category: opp.category,
      investment: `$${(opp.investment_min || 0).toLocaleString()} - $${(opp.investment_max || 0).toLocaleString()}`,
      investment_min: opp.investment_min || 0,
      investment_max: opp.investment_max || 0,
      related_interests: opp.related_interests || [],
      location: opp.location || '',
      source: 'db',
    }));

    const allOpportunities = [...dbOpps, ...realEstateOpps, ...franchiseOpps];

    if (allOpportunities.length === 0) {
      return Response.json({ success: false, error: 'No opportunities available to match against.' });
    }

    const userContext = {
      name: user.full_name,
      bio: userData.bio || '',
      title: userData.title || '',
      location: userData.location || '',
      investment_range: userData.investment_range || 'Not specified',
      partnership_goals: userData.partnership_goals || '',
      skills: userData.skills || [],
      interests: interests.map(i => i.interest_name),
      pastPartnerships: partnershipIntents.map(p => ({
        opportunity: p.opportunity_name,
        status: p.current_status
      })),
    };

    const aiPrompt = `You are an expert business partnership matchmaker. Analyze the user's profile and recommend the TOP 6 most relevant opportunities.

USER PROFILE:
- Name: ${userContext.name}
- Title: ${userContext.title || 'Professional'}
- Location: ${userContext.location || 'Not specified'}
- Investment Range: ${userContext.investment_range}
- Partnership Goals: ${userContext.partnership_goals || 'Not specified'}
- Skills: ${userContext.skills.join(', ') || 'Not specified'}
- Interests: ${userContext.interests.join(', ') || 'None listed'}
- Bio: ${userContext.bio || 'Not provided'}
- Past partnerships: ${userContext.pastPartnerships.length}

SCORING RUBRIC (total = 100 points):
1. Interest & Category Alignment (25 pts): Match between opportunity category/description and user's stated interests
2. Investment Range Fit (25 pts): Does the investment requirement fit the user's stated investment range?
3. Partnership Goals Alignment (20 pts): Does this opportunity type serve the user's stated partnership goals?
4. Location Relevance (15 pts): Is the opportunity in the same city/region/country as the user?
5. Profile & Bio Context (15 pts): Does it align with the user's professional title, bio, and background?

AVAILABLE OPPORTUNITIES:
${JSON.stringify(allOpportunities.slice(0, 80).map((o, idx) => ({
  index: idx,
  id: o.id,
  title: o.title,
  description: o.description,
  category: o.category,
  investment: o.investment,
  location: o.location,
  related_interests: o.related_interests,
  source: o.source,
})), null, 2)}

Return TOP 6 matches. Return ONLY valid JSON:
{
  "recommendations": [
    {
      "opportunity_index": number,
      "match_score": number,
      "match_reason": "1-2 sentence explanation of the primary match reasons"
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
      temperature: 0.6
    });

    const aiResult = JSON.parse(response.choices[0].message.content);

    const enrichedRecommendations = (aiResult.recommendations || [])
      .map(rec => {
        const opportunity = allOpportunities[rec.opportunity_index];
        if (!opportunity) return null;
        return {
          ...opportunity,
          match_score: Math.min(100, Math.max(0, Math.round(rec.match_score))),
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