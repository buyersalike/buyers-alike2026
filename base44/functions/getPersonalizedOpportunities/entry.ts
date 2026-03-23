import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      userProfileArr,
      userInterests,
      forumPosts,
      savedNews,
      connections,
      dbOpportunities,
      realEstateCaches,
      franchiseCaches,
      partnershipIntents,
    ] = await Promise.all([
      base44.entities.User.filter({ email: user.email }),
      base44.entities.Interest.filter({ user_email: user.email, status: 'approved' }),
      base44.entities.ForumPost.filter({ author_email: user.email }),
      base44.entities.SavedNews.filter({ user_email: user.email }),
      base44.entities.Connection.filter({ user1_email: user.email }),
      base44.entities.Opportunity.list('-created_date', 50),
      base44.entities.RealEstateCache.list('-created_date', 1),
      base44.entities.FranchiseCache.list('-created_date', 1),
      base44.entities.PartnershipIntent.filter({ user_email: user.email }),
    ]);

    const userData = userProfileArr[0] || {};

    // Combine all opportunity sources
    const realEstateOpps = (realEstateCaches[0]?.opportunities || []).slice(0, 30).map(opp => ({
      id: opp.id || `re_${opp.title?.substring(0, 10)}`,
      title: opp.title,
      description: (opp.description || '').substring(0, 300),
      category: opp.type || 'Real Estate',
      investment: opp.investment,
      location: opp.location || opp.address || '',
      source: 'real_estate',
    }));

    const franchiseOpps = (franchiseCaches[0]?.opportunities || []).slice(0, 30).map(opp => ({
      id: opp.id || `fr_${opp.title?.substring(0, 10)}`,
      title: opp.title,
      description: (opp.description || '').substring(0, 300),
      category: 'Franchise',
      investment: opp.investment,
      location: opp.location || '',
      source: 'franchise',
    }));

    const dbOpps = dbOpportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      description: (opp.description || '').substring(0, 300),
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
      return Response.json({ success: false, opportunities: [], error: 'No opportunities available.' });
    }

    // Build rich user context
    const userContext = {
      name: user.full_name,
      title: userData.title || user.title || '',
      bio: userData.bio || user.bio || '',
      location: userData.location || user.location || '',
      investment_range: userData.investment_range || user.investment_range || 'Not specified',
      partnership_goals: userData.partnership_goals || user.partnership_goals || '',
      skills: userData.skills || user.skills || [],
      interests: userInterests.map(i => i.interest_name),
      forum_topics: forumPosts.map(p => p.title).slice(0, 8),
      saved_news_topics: savedNews.map(n => n.article_title).slice(0, 8),
      connection_count: connections.length,
      past_partnership_count: partnershipIntents.length,
    };

    const prompt = `You are an expert business partnership matchmaker. Score each opportunity for this user using a nuanced, weighted approach.

USER PROFILE:
- Name: ${userContext.name}
- Title: ${userContext.title || 'Professional'}
- Location: ${userContext.location || 'Not specified'}
- Investment Range: ${userContext.investment_range}
- Partnership Goals: ${userContext.partnership_goals || 'Not specified'}
- Skills: ${userContext.skills.join(', ') || 'Not specified'}
- Stated Interests: ${userContext.interests.join(', ') || 'None listed'}
- Bio: ${userContext.bio || 'Not provided'}
- Forum engagement topics: ${userContext.forum_topics.join(', ') || 'None'}
- Saved news topics: ${userContext.saved_news_topics.join(', ') || 'None'}
- Network size: ${userContext.connection_count} connections
- Past partnership attempts: ${userContext.past_partnership_count}

SCORING RUBRIC (total = 100 points):
1. Interest & Category Alignment (25 pts): How well does the opportunity's category/description match the user's stated interests?
2. Investment Range Fit (25 pts): Does the opportunity's investment level match the user's stated investment range? Penalize heavily for mismatches outside ±50%.
3. Partnership Goals Alignment (20 pts): Does this opportunity type help achieve what the user said they're looking for?
4. Location Relevance (15 pts): Is the opportunity local/national/relevant to the user's location? Award full points only if same city/region, partial for same country.
5. Profile & Bio Context (15 pts): Does the opportunity align with the user's professional background, bio, and forum/news engagement?

AVAILABLE OPPORTUNITIES (evaluate the top 60 only):
${JSON.stringify(allOpportunities.slice(0, 60).map((o, idx) => ({
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

Return the TOP 8 best matches. For each:
- opportunity_index (number, from list above)
- match_score (0-100, sum of all rubric categories — be precise, avoid round numbers like 75/80/85)
- score_breakdown: { interest_alignment: n, investment_fit: n, goals_alignment: n, location_relevance: n, profile_context: n }
- match_explanation (1-2 sentences explaining the PRIMARY reason this matches)
- match_reasons (array of 2-3 concise bullet points, one per key rubric area that scored well)

Return ONLY valid JSON: { "recommendations": [ { "opportunity_index": n, "match_score": n, "score_breakdown": {...}, "match_explanation": "...", "match_reasons": ["...", "..."] } ] }`;

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional partnership matchmaking AI. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const aiResult = JSON.parse(response.choices[0].message.content);

    const scoredOpportunities = (aiResult.recommendations || [])
      .map(rec => {
        const opp = allOpportunities[rec.opportunity_index];
        if (!opp) return null;
        return {
          ...opp,
          matchScore: Math.min(100, Math.max(0, Math.round(rec.match_score))),
          matchExplanation: rec.match_explanation || '',
          matchReasons: rec.match_reasons || [],
          scoreBreakdown: rec.score_breakdown || {},
          ai_recommended: true,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);

    return Response.json({
      success: true,
      opportunities: scoredOpportunities,
      userProfile: {
        hasInterests: userContext.interests.length > 0,
        hasInvestmentRange: !!userData.investment_range || !!user.investment_range,
        hasPartnershipGoals: !!userData.partnership_goals || !!user.partnership_goals,
        hasLocation: !!userContext.location,
        networkSize: userContext.connection_count,
      }
    });

  } catch (error) {
    console.error('Opportunity matching error:', error);
    return Response.json({
      error: error.message,
      success: false,
      opportunities: []
    }, { status: 500 });
  }
});