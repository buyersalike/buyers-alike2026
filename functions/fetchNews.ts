/**
 * fetchNews — Cache-first news fetcher using SerpAPI Google News.
 *
 * Strategy:
 *  1. Check NewsCache in the database. If valid (non-expired) cache exists, return immediately.
 *  2. If missing or expired, call SerpAPI, deduplicate, sort newest-first, store in DB, return.
 *
 * Cache TTL: 3 hours (reduced so news stays fresh).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CACHE_TTL_HOURS = 3;

/**
 * Parse SerpAPI's relative date strings like "3 hours ago", "2 days ago", "1 week ago"
 * into real Date objects. Falls back to now if unparseable.
 */
function parseRelativeDate(dateStr) {
  if (!dateStr) return new Date();

  // Already an ISO string?
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime())) return direct;

  const now = new Date();
  const str = dateStr.toLowerCase().trim();

  const match = str.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    const ms = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    }[unit];
    return new Date(now.getTime() - value * ms);
  }

  // "Yesterday"
  if (str.includes('yesterday')) {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return now; // fallback
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  // Quick check: if lengths differ by more than 30%, skip expensive edit distance
  if (shorter.length / longer.length < 0.7) return 0;
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

/**
 * Map query topic to a display category
 */
function getCategory(topic) {
  const map = {
    'business news': 'Business',
    'finance markets': 'Finance',
    'technology startups': 'Technology',
    'real estate investment': 'Real Estate',
    'stock market': 'Markets',
    'franchise business': 'Business',
    'entrepreneurship': 'Business',
    'canadian economy': 'Business',
  };
  return map[topic] || 'Business';
}

async function fetchFreshArticles(SERP_API_KEY) {
  // 6 targeted queries run in parallel — covers all regions + categories well within timeout
  const queries = [
    { q: 'business news Canada finance', gl: 'ca', hl: 'en', region: 'Canada', tbs: 'qdr:w' },
    { q: 'real estate investment Canada', gl: 'ca', hl: 'en', region: 'Canada', tbs: 'qdr:w' },
    { q: 'technology startups entrepreneurship Canada', gl: 'ca', hl: 'en', region: 'Canada', tbs: 'qdr:w' },
    { q: 'business finance markets USA', gl: 'us', hl: 'en', region: 'United States', tbs: 'qdr:w' },
    { q: 'stock market today investing', gl: 'us', hl: 'en', region: 'United States', tbs: 'qdr:w' },
    { q: 'business finance China economy', gl: 'cn', hl: 'en', region: 'China', tbs: 'qdr:w' },
  ];

  const allArticles = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch all queries in parallel for speed
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
    if (result.status === 'rejected') {
      console.error('Query failed:', result.reason?.message);
      continue;
    }

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

  console.log(`Total raw articles before dedup: ${allArticles.length}`);

  // Deduplicate by title similarity (only compare normalized titles)
  const uniqueArticles = [];
  const seenTitles = [];

  for (const article of allArticles) {
    if (!article.title) continue;

    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    let isDuplicate = false;
    for (const seenTitle of seenTitles) {
      if (calculateSimilarity(normalizedTitle, seenTitle) > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seenTitles.push(normalizedTitle);
      uniqueArticles.push(article);
    }
  }

  // Always sort newest first
  uniqueArticles.sort((a, b) => b.timestamp - a.timestamp);

  console.log(`Unique articles after dedup: ${uniqueArticles.length}`);
  return uniqueArticles.slice(0, 120);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const SERP_API_KEY = Deno.env.get('SERP_API');
    if (!SERP_API_KEY) {
      return Response.json({ error: 'SERP API key not configured', articles: [] }, { status: 200 });
    }

    // --- FRESH FETCHING DISABLED (SerpAPI credits exhausted) ---
    // Only serve cached data. Re-enable the "Refresh News Cache" automation
    // and remove this block when SerpAPI credits are available again.

    const caches = await base44.asServiceRole.entities.NewsCache.list('-created_date', 1);

    if (caches.length > 0 && caches[0].articles?.length > 0) {
      console.log(`Serving cached data (fresh fetching disabled): ${caches[0].articles.length} articles`);
      return Response.json({
        articles: caches[0].articles,
        totalResults: caches[0].articles.length,
        fromCache: true,
        cachedAt: caches[0].fetched_at,
      });
    }

    console.log('No cached articles available and fresh fetching is disabled.');
    return Response.json({ articles: [], totalResults: 0 });

  } catch (error) {
    return Response.json({ error: error.message, articles: [] }, { status: 500 });
  }
});