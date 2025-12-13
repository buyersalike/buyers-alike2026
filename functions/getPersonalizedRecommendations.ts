import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user context
    const [forumPosts, forumComments, connections] = await Promise.all([
      base44.entities.ForumPost.filter({ author_email: user.email }),
      base44.entities.ForumComment.filter({ author_email: user.email }),
      base44.entities.Connection.list()
    ]);

    const userConnections = connections.filter(
      c => (c.user1_email === user.email || c.user2_email === user.email) && c.status === 'connected'
    );

    // Build user profile context
    const userContext = {
      interests: user.interests || [],
      title: user.title || '',
      location: user.location || '',
      bio: user.bio || '',
      forumActivity: {
        posts: forumPosts.length,
        comments: forumComments.length,
        recentTopics: forumPosts.slice(0, 5).map(p => p.title)
      },
      connectionCount: userConnections.length
    };

    const prompt = `You are a business recommendation AI assistant. Based on the user's profile, provide personalized recommendations for:
1. Business opportunities they should explore
2. Vendors/service providers that could help them
3. Forum topics they should engage with
4. Potential business connections

User Profile:
- Title: ${userContext.title || 'Business Professional'}
- Location: ${userContext.location || 'Not specified'}
- Interests: ${userContext.interests.join(', ') || 'General business'}
- Bio: ${userContext.bio || 'Not provided'}
- Forum Activity: ${userContext.forumActivity.posts} posts, ${userContext.forumActivity.comments} comments
- Recent Forum Topics: ${userContext.forumActivity.recentTopics.join(', ') || 'None'}
- Current Connections: ${userContext.connectionCount}

Provide specific, actionable recommendations tailored to this user's profile and activity.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                relevanceReason: { type: "string" }
              }
            }
          },
          vendors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                description: { type: "string" },
                whyRecommended: { type: "string" }
              }
            }
          },
          forumTopics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          connections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                profileType: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        },
        required: ["opportunities", "vendors", "forumTopics", "connections"]
      }
    });

    return Response.json({
      success: true,
      recommendations: aiResponse
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});