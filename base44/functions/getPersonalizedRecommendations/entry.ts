import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

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

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    const aiResponse = JSON.parse(response.choices[0].message.content);

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