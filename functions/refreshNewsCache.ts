/**
 * refreshNewsCache — Scheduled job to proactively refresh the news cache.
 * Run this every 6 hours via an automation so that users ALWAYS get cached data instantly.
 * This is an admin-only / scheduled endpoint.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CACHE_TTL_HOURS = 3;

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1, str2) {
  const costs = [];
  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[str2.length] = lastValue;
  }
  return costs[str2.length];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const SERP_API_KEY = Deno.env.get('SERP_API');
    if (!SERP_API_KEY) {
      return Response.json({ error: 'SERP API key not configured' }, { status: 500 });
    }

    // 6 queries — same as fetchNews
    const queries = [
      { q: 'business news Canada finance', gl: 'ca', hl: 'en', region: 'Canada', tbs: 'qdr:w' },
      { q: 'real estate investment Canada', gl: 'ca', hl: 'en', region: 'Canada', tbs: 'qdr:w' },
      { q: 'technology startups entrepreneurship Canada', gl: 'ca', hl: 'en', region: 'Canada', tbs: 'qdr:w' },
      { q: 'business finance markets USA', gl: 'us', hl: 'en', region: 'United States', tbs: 'qdr:w' },
      { q: 'stock market today investing', gl: 'us', hl: 'en', region: 'United States', tbs: 'qdr:w' },
      { q: 'business finance China economy', gl: 'cn', hl: 'en', region: 'China', tbs: 'qdr:w' },
    ];

    function parseRelativeDate(dateStr) {
      if (!dateStr) return new Date();
      const direct = new Date(dateStr);
      if (!isNaN(direct.getTime())) return direct;
      const now = new Date();
      const str = dateStr.toLowerCase().trim();
      const match = str.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        const ms = { second: 1000, minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, year: 31536000000 }[unit];
        return new Date(now.getTime() - value * ms);
      }
      if (str.includes('yesterday')) return new Date(now.getTime() - 86400000);
      return now;
    }

    function getCategory(q) {
      if (q.includes('technology') || q.includes('startup')) return 'Technology';
      if (q.includes('finance') || q.includes('stock')) return 'Finance';
      if (q.includes('real estate')) return 'Real Estate';
      return 'Business';
    }

    const allArticles = [];
    const results = await Promise.allSettled(
      queries.map(async (query) => {
        const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query.q)}&gl=${query.gl}&hl=${query.hl}&tbs=${query.tbs}&api_key=${SERP_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { data, query };
      })
    );

    for (const result of results) {
      if (result.status === 'rejected') { console.error('Query failed:', result.reason?.message); continue; }
      const { data, query } = result.value;
      const newsResults = data.news_results || [];
      for (let index = 0; index < newsResults.length; index++) {
        const article = newsResults[index];
        const publishedDate = parseRelativeDate(article.date);
        allArticles.push({
          id: `${query.region}-${index}-${Date.now()}-${Math.random()}`,
          title: article.title,
          description: article.snippet || article.title,
          content: article.snippet,
          url: article.link,
          image: article.thumbnail,
          source: article.source?.name || query.region,
          author: article.source?.name,
          publishedAt: publishedDate.toISOString(),
          category: getCategory(query.q),
          region: query.region,
          timestamp: publishedDate.getTime(),
        });
      }
    }

    if (allArticles.length === 0) {
      return Response.json({ error: 'No articles fetched from SerpAPI', count: 0 }, { status: 500 });
    }

    // Deduplicate
    const uniqueArticles = [];
    const seenTitles = [];
    for (const article of allArticles) {
      if (!article.title) continue;
      const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      let isDuplicate = false;
      for (const seenTitle of seenTitles) {
        if (calculateSimilarity(normalizedTitle, seenTitle) > 0.8) { isDuplicate = true; break; }
      }
      if (!isDuplicate) { seenTitles.push(normalizedTitle); uniqueArticles.push(article); }
    }
    // Always sort newest first
    uniqueArticles.sort((a, b) => b.timestamp - a.timestamp);
    const finalArticles = uniqueArticles.slice(0, 120);

    const now = new Date();
    const fetchedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

    // Delete old caches
    const oldCaches = await base44.asServiceRole.entities.NewsCache.list('-created_date', 10);
    for (const old of oldCaches) {
      await base44.asServiceRole.entities.NewsCache.delete(old.id);
    }

    await base44.asServiceRole.entities.NewsCache.create({
      articles: finalArticles,
      fetched_at: fetchedAt,
      expires_at: expiresAt,
    });

    return Response.json({ success: true, count: finalArticles.length, cachedUntil: expiresAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});