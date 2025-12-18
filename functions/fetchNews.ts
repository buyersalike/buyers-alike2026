import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const SERP_API_KEY = Deno.env.get("SERP_API");
    
    if (!SERP_API_KEY) {
      return Response.json({ 
        error: 'SERP API key not configured',
        articles: []
      }, { status: 200 });
    }

    // Fetch business and finance news from Canada, US, and China
    const queries = [
      { q: 'business finance', gl: 'ca', hl: 'en', region: 'Canada' },
      { q: 'business finance', gl: 'us', hl: 'en', region: 'United States' },
      { q: 'business finance', gl: 'cn', hl: 'en', region: 'China' },
    ];

    const allArticles = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query.q)}&gl=${query.gl}&hl=${query.hl}&api_key=${SERP_API_KEY}`
        );

        if (!response.ok) continue;

        const data = await response.json();
        
        if (data.news_results) {
          const articles = data.news_results.map((article, index) => ({
            id: `${query.region}-${index}-${Date.now()}`,
            title: article.title,
            description: article.snippet || article.title,
            content: article.snippet,
            url: article.link,
            image: article.thumbnail,
            source: article.source?.name || query.region,
            author: article.source?.name,
            publishedAt: article.date || new Date().toISOString(),
            category: 'Business',
            region: query.region,
          }));
          
          allArticles.push(...articles);
        }
      } catch (error) {
        console.error(`Error fetching news for ${query.region}:`, error);
      }
    }

    return Response.json({ 
      articles: allArticles.slice(0, 50),
      totalResults: allArticles.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      articles: []
    }, { status: 500 });
  }
});