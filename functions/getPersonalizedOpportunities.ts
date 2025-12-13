import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user context
    const [forumPosts, forumComments, savedNews] = await Promise.all([
      base44.entities.ForumPost.filter({ author_email: user.email }),
      base44.entities.ForumComment.filter({ author_email: user.email }),
      base44.entities.SavedNews.filter({ user_email: user.email })
    ]);

    // Build comprehensive user profile
    const userProfile = {
      interests: user.interests || [],
      title: user.title || '',
      location: user.location || '',
      bio: user.bio || '',
      forumTopics: forumPosts.map(p => p.title).slice(0, 10),
      recentComments: forumComments.map(c => c.content).slice(0, 10),
      savedNewsTopics: savedNews.map(n => n.article_title).slice(0, 10)
    };

    // Sample opportunities (in a real app, these would come from your database)
    const opportunities = [
      { id: 1, title: "Tech Startup Investment", category: "Investment", description: "Early-stage AI/ML startup seeking seed funding", industry: "Technology" },
      { id: 2, title: "E-commerce Partnership", category: "Partnership", description: "Established e-commerce platform looking for logistics partners", industry: "Retail" },
      { id: 3, title: "Healthcare Innovation", category: "Joint Venture", description: "Telemedicine platform expansion opportunity", industry: "Healthcare" },
      { id: 4, title: "Real Estate Development", category: "Investment", description: "Mixed-use commercial property development", industry: "Real Estate" },
      { id: 5, title: "Green Energy Project", category: "Investment", description: "Renewable energy infrastructure project", industry: "Energy" },
      { id: 6, title: "Food & Beverage Franchise", category: "Franchise", description: "Expanding restaurant chain seeking franchisees", industry: "Food & Beverage" },
      { id: 7, title: "SaaS Product Partnership", category: "Partnership", description: "B2B software company seeking distribution partners", industry: "Technology" },
      { id: 8, title: "Manufacturing Joint Venture", category: "Joint Venture", description: "Automotive parts manufacturer seeking partners", industry: "Manufacturing" },
      { id: 9, title: "Digital Marketing Agency", category: "Acquisition", description: "Profitable agency with established client base", industry: "Marketing" },
      { id: 10, title: "Logistics Network Expansion", category: "Partnership", description: "Last-mile delivery network seeking regional partners", industry: "Logistics" }
    ];

    const prompt = `You are an AI business opportunity matching expert. Analyze the user's profile and score each opportunity based on relevance.

User Profile:
- Title: ${userProfile.title || 'Business Professional'}
- Location: ${userProfile.location || 'Not specified'}
- Interests: ${userProfile.interests.join(', ') || 'General business'}
- Bio: ${userProfile.bio || 'Not provided'}
- Forum Topics Engaged: ${userProfile.forumTopics.join(', ') || 'None'}
- Recent News Interests: ${userProfile.savedNewsTopics.join(', ') || 'None'}

Opportunities to Score:
${opportunities.map((o, i) => `${i + 1}. ${o.title} (${o.category}, ${o.industry}) - ${o.description}`).join('\n')}

For each opportunity, provide:
1. A match score (0-100) based on alignment with user's profile, interests, and activity
2. A brief explanation of why this score was given
3. Key reasons for the match

Consider: professional background, stated interests, forum engagement patterns, and news reading behavior.`;

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
                }
              }
            }
          }
        },
        required: ["matches"]
      }
    });

    // Combine opportunities with AI scores
    const scoredOpportunities = opportunities.map((opp, idx) => {
      const match = aiResponse.matches.find(m => m.opportunityIndex === idx);
      return {
        ...opp,
        matchScore: match?.matchScore || 0,
        matchExplanation: match?.explanation || '',
        matchReasons: match?.keyReasons || []
      };
    });

    // Sort by match score
    scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);

    return Response.json({
      success: true,
      opportunities: scoredOpportunities,
      userProfile: {
        hasInterests: userProfile.interests.length > 0,
        hasActivity: forumPosts.length > 0 || savedNews.length > 0
      }
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false,
      opportunities: []
    }, { status: 500 });
  }
});