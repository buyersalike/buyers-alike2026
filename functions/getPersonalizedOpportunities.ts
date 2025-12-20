import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comprehensive user data
    const [
      userInterests,
      forumPosts,
      forumComments,
      savedNews,
      connections,
      opportunities,
      partnerships
    ] = await Promise.all([
      base44.entities.Interest.filter({ user_email: user.email, status: 'approved' }),
      base44.entities.ForumPost.filter({ author_email: user.email }),
      base44.entities.ForumComment.filter({ author_email: user.email }),
      base44.entities.SavedNews.filter({ user_email: user.email }),
      base44.entities.Connection.filter({ 
        $or: [
          { user1_email: user.email, status: 'connected' },
          { user2_email: user.email, status: 'connected' }
        ]
      }),
      base44.entities.Opportunity.list('-created_date', 50),
      base44.entities.Partnership.filter({ owner_email: user.email })
    ]);

    // Get all users for connection analysis
    const allUsers = await base44.entities.User.list();

    // Analyze successful connections (users with similar profiles who connected)
    const connectedUsers = connections.map(conn => 
      conn.user1_email === user.email ? conn.user2_email : conn.user1_email
    );
    const connectedProfiles = allUsers.filter(u => connectedUsers.includes(u.email));

    // Build comprehensive user profile
    const userProfile = {
      interests: userInterests.map(i => i.interest_name),
      skills: user.skills || [],
      industries: user.industries || [],
      title: user.title || user.position || '',
      location: user.location || user.state || '',
      bio: user.bio || user.overview || '',
      investmentHistory: user.investment_history || [],
      forumTopics: forumPosts.map(p => p.title).slice(0, 10),
      forumCategories: [...new Set(forumPosts.map(p => p.category_id))],
      recentComments: forumComments.map(c => c.content).slice(0, 10),
      savedNewsTopics: savedNews.map(n => n.article_title).slice(0, 10),
      connectionCount: connections.length,
      partnershipExperience: partnerships.map(p => ({
        stage: p.stage,
        industry: p.industry,
        dealSize: p.deal_size
      })),
      connectedIndustries: connectedProfiles
        .flatMap(cp => cp.industries || [])
        .filter(Boolean),
      connectedInterests: connectedProfiles
        .flatMap(cp => cp.interests || [])
        .filter(Boolean)
    };

    // Calculate investment preferences from history
    const investmentPreferences = calculateInvestmentPreferences(userProfile.investmentHistory);

    const prompt = `You are an advanced AI opportunity matching expert with deep understanding of business partnerships, investments, and professional networks.

Analyze the user's comprehensive profile and score each opportunity based on multiple sophisticated factors:

USER PROFILE:
- Professional Title: ${userProfile.title || 'Business Professional'}
- Location: ${userProfile.location || 'Not specified'}
- Skills: ${userProfile.skills.join(', ') || 'Not specified'}
- Industries of Expertise: ${userProfile.industries.join(', ') || 'General business'}
- Stated Interests: ${userProfile.interests.join(', ') || 'None'}
- Bio: ${userProfile.bio || 'Not provided'}

INVESTMENT HISTORY ANALYSIS:
- Total Past Investments: ${userProfile.investmentHistory.length}
- Preferred Categories: ${investmentPreferences.categories.join(', ') || 'None'}
- Typical Investment Range: ${investmentPreferences.range}
- Success Rate: ${investmentPreferences.successRate}%

NETWORK & CONNECTIONS:
- Total Connections: ${userProfile.connectionCount}
- Industries in Network: ${[...new Set(userProfile.connectedIndustries)].join(', ') || 'None'}
- Common Interests in Network: ${[...new Set(userProfile.connectedInterests)].join(', ') || 'None'}

ACTIVITY & ENGAGEMENT:
- Forum Topics Engaged: ${userProfile.forumTopics.join(', ') || 'None'}
- Active Discussion Areas: ${userProfile.forumCategories.length} categories
- News Reading Patterns: ${userProfile.savedNewsTopics.join(', ') || 'None'}

PARTNERSHIP EXPERIENCE:
- Active Partnerships: ${userProfile.partnershipExperience.length}
- Experience with: ${userProfile.partnershipExperience.map(p => p.industry).filter(Boolean).join(', ') || 'No prior partnerships'}

OPPORTUNITIES TO EVALUATE:
${opportunities.map((o, i) => `${i + 1}. ${o.title} (${o.category}, ${o.investment_min ? '$' + o.investment_min.toLocaleString() + '-$' + (o.investment_max || o.investment_min).toLocaleString() : 'Contact for details'})
   Description: ${o.description}
   Related Interests: ${o.related_interests?.join(', ') || 'None'}
   Status: ${o.status}`).join('\n\n')}

SCORING CRITERIA (weighted):
1. Industry/Skills Alignment (30%): Match between opportunity requirements and user's expertise/skills
2. Investment History Pattern (25%): Alignment with past successful investment categories and ranges
3. Network Synergy (20%): Connection to industries/interests common in user's successful network
4. Interest Relevance (15%): Match with user's stated interests and related opportunity tags
5. Activity Patterns (10%): Alignment with forum engagement and news reading behavior

For each opportunity, provide:
1. Match score (0-100) considering ALL weighted factors
2. Detailed explanation of the scoring
3. Specific reasons highlighting which criteria contributed most
4. Risk assessment based on investment history

Return ONLY the top 10 best matches, sorted by score.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunityIndex: { type: "number" },
                matchScore: { type: "number" },
                explanation: { type: "string" },
                keyReasons: {
                  type: "array",
                  items: { type: "string" }
                },
                riskAssessment: { type: "string" }
              }
            }
          }
        },
        required: ["matches"]
      }
    });

    // Combine opportunities with AI scores
    const scoredOpportunities = aiResponse.matches.map(match => {
      const opp = opportunities[match.opportunityIndex];
      return {
        ...opp,
        matchScore: match.matchScore || 0,
        matchExplanation: match.explanation || '',
        matchReasons: match.keyReasons || [],
        riskAssessment: match.riskAssessment || ''
      };
    }).filter(opp => opp.id); // Filter out any invalid matches

    // Sort by match score
    scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);

    return Response.json({
      success: true,
      opportunities: scoredOpportunities.slice(0, 10),
      userProfile: {
        hasInterests: userProfile.interests.length > 0,
        hasActivity: forumPosts.length > 0 || savedNews.length > 0,
        hasInvestmentHistory: userProfile.investmentHistory.length > 0,
        networkSize: userProfile.connectionCount
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

function calculateInvestmentPreferences(investmentHistory) {
  if (!investmentHistory || investmentHistory.length === 0) {
    return {
      categories: [],
      range: 'No history',
      successRate: 0
    };
  }

  // Get most common categories
  const categoryCount = {};
  investmentHistory.forEach(inv => {
    categoryCount[inv.category] = (categoryCount[inv.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  // Calculate success rate
  const successful = investmentHistory.filter(inv => inv.success).length;
  const successRate = Math.round((successful / investmentHistory.length) * 100);

  // Determine typical range
  const ranges = investmentHistory.map(inv => inv.amount_range).filter(Boolean);
  const mostCommonRange = ranges.length > 0 ? 
    ranges.sort((a,b) => ranges.filter(v => v===a).length - ranges.filter(v => v===b).length).pop() :
    'Varies';

  return {
    categories: topCategories,
    range: mostCommonRange,
    successRate
  };
}