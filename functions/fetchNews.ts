import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");
    
    if (!NEWS_API_KEY) {
      return Response.json({ 
        error: 'News API key not configured',
        articles: []
      }, { status: 200 });
    }

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch news from API (example using NewsAPI.org format)
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=business OR market OR finance&from=${fromDate}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();

    // Transform the articles to match our format
    const articles = data.articles?.map((article, index) => ({
      id: `${article.publishedAt}-${index}`,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image: article.urlToImage,
      source: article.source.name,
      author: article.author,
      publishedAt: article.publishedAt,
      category: 'Business', // Can be enhanced with categorization logic
    })) || [];

    return Response.json({ 
      articles: articles.slice(0, 50), // Limit to 50 articles
      totalResults: data.totalResults || 0
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      articles: []
    }, { status: 500 });
  }
});