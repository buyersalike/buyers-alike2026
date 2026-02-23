import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CACHE_TTL_DAYS = 1;

// Category image mapping for franchise types
const categoryImages = {
  'food': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  'fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
  'cleaning': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
  'health': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
  'home': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
  'retail': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop',
  'business': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
  'auto': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
  'pet': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
  'default': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
};

function getImageForTitle(title) {
  const t = title.toLowerCase();
  if (t.includes('food') || t.includes('restaurant') || t.includes('pizza') || t.includes('burger') || t.includes('chicken') || t.includes('coffee') || t.includes('sandwich') || t.includes('cone') || t.includes('baking')) return categoryImages.food;
  if (t.includes('fitness') || t.includes('gym') || t.includes('sport') || t.includes('athletics') || t.includes('yoga')) return categoryImages.fitness;
  if (t.includes('clean') || t.includes('window') || t.includes('janitorial') || t.includes('maid')) return categoryImages.cleaning;
  if (t.includes('education') || t.includes('tutor') || t.includes('school') || t.includes('learning') || t.includes('child') || t.includes('kids')) return categoryImages.education;
  if (t.includes('health') || t.includes('medical') || t.includes('care') || t.includes('dental') || t.includes('senior')) return categoryImages.health;
  if (t.includes('home') || t.includes('house') || t.includes('inspection') || t.includes('renovation') || t.includes('floor')) return categoryImages.home;
  if (t.includes('retail') || t.includes('store') || t.includes('shop') || t.includes('mattress')) return categoryImages.retail;
  if (t.includes('auto') || t.includes('car') || t.includes('vehicle') || t.includes('oil')) return categoryImages.auto;
  if (t.includes('pet') || t.includes('dog') || t.includes('animal')) return categoryImages.pet;
  if (t.includes('business') || t.includes('coach') || t.includes('consulting') || t.includes('broker') || t.includes('sales')) return categoryImages.business;
  return categoryImages.default;
}

function parseCashRequired(text) {
  if (!text) return null;
  const match = text.match(/\$?([\d,]+\.?\d*)\s*k?/i);
  if (!match) return null;
  let num = parseFloat(match[1].replace(/,/g, ''));
  if (text.toLowerCase().includes('k')) num *= 1000;
  return num;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const serpApiKey = Deno.env.get('SERP_API');
    if (!serpApiKey) {
      return Response.json({ error: 'SERP_API key not configured' }, { status: 500 });
    }

    const opportunities = [];
    const pages = [1, 2, 3, 4]; // fetch multiple pages for ~40 results

    for (const page of pages) {
      const start = (page - 1) * 10;
      const url = `https://serpapi.com/search.json?engine=google&q=site:franchisegator.com+canada+franchise+opportunities&num=10&start=${start}&api_key=${serpApiKey}`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const results = data.organic_results || [];

      for (const result of results) {
        const title = result.title || '';
        const snippet = result.snippet || '';
        const link = result.link || '';

        // Only include actual franchise listing pages
        if (!link.includes('/franchises/') && !link.includes('/opportunities/')) continue;
        if (title.toLowerCase().includes('top 100') || title.toLowerCase().includes('list of')) continue;

        // Extract cash required from snippet
        const cashMatch = snippet.match(/\$?([\d,]+\.?\d*\s*k?)\s*(minimum cash|cash required|min(?:imum)?)/i);
        const cashText = cashMatch ? cashMatch[0] : null;
        const cashAmount = cashText ? parseCashRequired(cashText) : null;

        const investment = cashAmount
          ? `$${cashAmount.toLocaleString('en-CA')} minimum`
          : 'Contact for details';

        const maxPartners = Math.floor(Math.random() * 15) + 3;

        opportunities.push({
          id: `fg-${link.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2, 10)}`,
          type: 'Franchise',
          title: title.replace(' - Franchise Gator', '').replace(' | Franchise Gator', '').trim(),
          description: snippet,
          investment,
          investmentMin: cashAmount || 0,
          investmentMax: cashAmount ? cashAmount * 3 : 0,
          image: getImageForTitle(title),
          link,
          postedDate: 'Current listing',
          partners: `1/${maxPartners} partners`,
          source: 'franchisegator',
        });
      }
    }

    if (opportunities.length === 0) {
      return Response.json({ error: 'No franchise listings found', success: false }, { status: 500 });
    }

    // Deduplicate by title
    const seen = new Set();
    const unique = opportunities.filter(o => {
      if (seen.has(o.title)) return false;
      seen.add(o.title);
      return true;
    });

    const fetchedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Clear old cache
    const oldCaches = await base44.asServiceRole.entities.FranchiseCache.list('-created_date', 10);
    for (const old of oldCaches) {
      await base44.asServiceRole.entities.FranchiseCache.delete(old.id);
    }

    await base44.asServiceRole.entities.FranchiseCache.create({
      opportunities: unique,
      fetched_at: fetchedAt,
      expires_at: expiresAt,
    });

    return Response.json({
      success: true,
      count: unique.length,
      fetchedAt,
      cachedUntil: expiresAt,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});