import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user interests and saved news for context
    const savedNews = await base44.entities.SavedNews.filter({ user_email: user.email });
    
    // Fetch latest news
    const newsResponse = await base44.functions.invoke('fetchNews', {});
    const articles = newsResponse.data?.articles || [];

    if (articles.length === 0) {
      return Response.json({ articles: [], recommendations: [] });
    }

    // Use AI to rank and personalize articles
    const userContext = {
      interests: user.interests || [],
      title: user.title || '',
      location: user.location || '',
      savedTopics: savedNews.map(n => n.article_title).slice(0, 10)
    };

    const prompt = `You are a news personalization assistant. Given a user's profile and a list of news articles, rank the articles by relevance to the user.

User Profile:
- Interests: ${userContext.interests.join(', ') || 'General business'}
- Title: ${userContext.title || 'Not specified'}
- Location: ${userContext.location || 'Not specified'}
- Recently saved topics: ${userContext.savedTopics.join(', ') || 'None'}

News Articles (${articles.length} total):
${articles.slice(0, 30).map((a, i) => `${i + 1}. ${a.title} - ${a.description?.substring(0, 100) || 'No description'}`).join('\n')}

Return a JSON object with:
1. "rankedIndices": array of article indices (0-based) in order of relevance (most relevant first), limited to top 20
2. "recommendations": array of 3 brief explanations (one sentence each) of why certain articles are relevant to this user

Focus on matching articles to user interests, professional context, and reading history.`;

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    const aiResponse = JSON.parse(response.choices[0].message.content);

    // Reorder articles based on AI ranking
    const rankedArticles = aiResponse.rankedIndices
      .filter(idx => idx >= 0 && idx < articles.length)
      .map(idx => articles[idx])
      .slice(0, 20);

    // Add remaining articles at the end
    const usedIndices = new Set(aiResponse.rankedIndices);
    const remainingArticles = articles
      .filter((_, idx) => !usedIndices.has(idx))
      .slice(0, 10);

    return Response.json({
      articles: [...rankedArticles, ...remainingArticles],
      recommendations: aiResponse.recommendations || [],
      personalized: true
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      articles: [],
      recommendations: []
    }, { status: 500 });
  }
});