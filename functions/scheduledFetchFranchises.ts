import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CACHE_TTL_DAYS = 30;
const DEFAULT_FRANCHISE_IMAGE = 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=800&q=80';

function parseAmount(text) {
  if (!text) return null;
  const clean = text.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

function extractInvestmentFromSnippet(snippet) {
  if (!snippet) return { min: 0, max: 0, display: 'Contact for details' };

  // Match patterns like "$50,000" or "$50,000 - $200,000"
  const rangeMatch = snippet.match(/\$[\d,]+\s*[-–]\s*\$[\d,]+/);
  if (rangeMatch) {
    const nums = rangeMatch[0].match(/[\d,]+/g).map(n => parseInt(n.replace(/,/g, ''), 10));
    return { min: nums[0], max: nums[1], display: rangeMatch[0] };
  }

  const singleMatch = snippet.match(/\$([\d,]+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1].replace(/,/g, ''), 10);
    return { min: val, max: val * 3, display: `$${val.toLocaleString('en-CA')} minimum` };
  }

  return { min: 0, max: 0, display: 'Contact for details' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const serpApiKey = Deno.env.get('SERP_API');
    if (!serpApiKey) {
      return Response.json({ error: 'SERP_API key not configured' }, { status: 500 });
    }

    const opportunities = [];

    // --- Source 1: FranchiseGator via SerpAPI ---
    const fgPages = [1, 2, 3, 4];
    for (const page of fgPages) {
      const start = (page - 1) * 10;
      const url = `https://serpapi.com/search.json?engine=google&q=site:franchisegator.com+canada+franchise&num=10&start=${start}&api_key=${serpApiKey}`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const results = data.organic_results || [];

      for (const result of results) {
        const title = result.title || '';
        const snippet = result.snippet || '';
        const link = result.link || '';

        if (!link.includes('/franchises/') && !link.includes('/opportunities/')) continue;
        if (title.toLowerCase().includes('top 100') || title.toLowerCase().includes('list of')) continue;

        const image = result.thumbnail || result.pagemap?.cse_image?.[0]?.src || result.pagemap?.cse_thumbnail?.[0]?.src || null;
        const metatags = result.pagemap?.metatags?.[0] || {};
        const ogImage = metatags['og:image'] || metatags['twitter:image'] || null;
        const ogDescription = metatags['og:description'] || metatags['twitter:description'] || null;

        const finalImage = ogImage || image || DEFAULT_FRANCHISE_IMAGE;
        const finalDescription = ogDescription || snippet;

        const invest = extractInvestmentFromSnippet(snippet);

        const liquidCapitalMatch = snippet.match(/liquid\s+capital[^$]*\$([\d,]+)/i);
        const franchiseFeeMatch = snippet.match(/franchise\s+fee[^$]*\$([\d,]+)/i);
        const totalInvestmentMatch = snippet.match(/total\s+investment[^$]*\$([\d,]+(?:\s*[-–]\s*\$[\d,]+)?)/i);

        const liquidCapital = liquidCapitalMatch ? `$${liquidCapitalMatch[1]}` : null;
        const franchiseFee = franchiseFeeMatch ? `$${franchiseFeeMatch[1]}` : null;
        const totalInvestment = totalInvestmentMatch ? totalInvestmentMatch[0].replace(/total\s+investment[^$]*/i, '').trim() : null;

        const contactInfo = result.pagemap?.organization?.[0] || result.pagemap?.localbusiness?.[0] || null;
        const contactPhone = contactInfo?.telephone || null;
        const contactEmail = contactInfo?.email || null;
        const contactWebsite = contactInfo?.url || link;

        const maxPartners = Math.floor(Math.random() * 15) + 3;
        const cleanTitle = title.replace(' - Franchise Gator', '').replace(' | Franchise Gator', '').trim();

        opportunities.push({
          id: `fg-${link.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2, 10)}`,
          type: 'Franchise',
          title: cleanTitle,
          description: finalDescription,
          investment: invest.display,
          investmentMin: invest.min,
          investmentMax: invest.max,
          image: finalImage,
          link,
          postedDate: 'Current listing',
          partners: `1/${maxPartners} partners`,
          source: 'franchisegator',
          liquidCapital,
          franchiseFee,
          totalInvestment,
          contact: {
            phone: contactPhone,
            email: contactEmail,
            website: contactWebsite,
          },
        });
      }
    }

    // --- Source 2: Canada Franchise Opportunities via SerpAPI ---
    const cfoPages = [1, 2, 3, 4];
    for (const page of cfoPages) {
      const start = (page - 1) * 10;
      const url = `https://serpapi.com/search.json?engine=google&q=site:canadafranchiseopportunities.ca/franchise/&num=10&start=${start}&api_key=${serpApiKey}`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const results = data.organic_results || [];

      for (const result of results) {
        const title = result.title || '';
        const snippet = result.snippet || '';
        const link = result.link || '';

        if (!link.includes('/franchise/')) continue;
        if (title.toLowerCase().includes('franchise directory') || title.toLowerCase().includes('browse franchise')) continue;

        const image = result.thumbnail || result.pagemap?.cse_image?.[0]?.src || result.pagemap?.cse_thumbnail?.[0]?.src || null;
        const metatags = result.pagemap?.metatags?.[0] || {};
        const ogImage = metatags['og:image'] || metatags['twitter:image'] || null;
        const ogDescription = metatags['og:description'] || metatags['twitter:description'] || null;

        const finalImage = ogImage || image || DEFAULT_FRANCHISE_IMAGE;
        const finalDescription = ogDescription || snippet;

        // Extract investment from snippet — CFO uses "Personal contribution required: $X" and "Total Investment: $X"
        const personalContribMatch = snippet.match(/personal\s+contribution[^$]*\$([\d,\s]+)/i);
        const totalInvestMatch = snippet.match(/total\s+investment[^:]*:\s*\$([\d,\s]+(?:\s*(?:to|-|–)\s*\$[\d,\s]+)?)/i);

        let investMin = 0, investMax = 0, investDisplay = 'Contact for details';
        if (personalContribMatch) {
          investMin = parseInt(personalContribMatch[1].replace(/[,\s]/g, ''), 10) || 0;
        }
        if (totalInvestMatch) {
          const raw = totalInvestMatch[1];
          const nums = raw.match(/[\d,]+/g);
          if (nums && nums.length >= 2) {
            investMin = parseInt(nums[0].replace(/,/g, ''), 10);
            investMax = parseInt(nums[1].replace(/,/g, ''), 10);
            investDisplay = `$${investMin.toLocaleString('en-CA')} – $${investMax.toLocaleString('en-CA')}`;
          } else if (nums && nums.length === 1) {
            const val = parseInt(nums[0].replace(/,/g, ''), 10);
            investMin = val;
            investMax = val;
            investDisplay = `$${val.toLocaleString('en-CA')}`;
          }
        } else {
          const invest = extractInvestmentFromSnippet(snippet);
          investMin = invest.min;
          investMax = invest.max;
          investDisplay = invest.display;
        }

        const contactInfo = result.pagemap?.organization?.[0] || result.pagemap?.localbusiness?.[0] || null;
        const contactPhone = contactInfo?.telephone || null;
        const contactEmail = contactInfo?.email || null;
        const contactWebsite = contactInfo?.url || link;

        const maxPartners = Math.floor(Math.random() * 15) + 3;
        const cleanTitle = title
          .replace(/\s*[-|]\s*Canada Franchise Opportunities.*/i, '')
          .replace(/\s*[-|]\s*Franchise.*/i, '')
          .trim();

        opportunities.push({
          id: `cfo-${link.split('/').filter(Boolean).pop() || Math.random().toString(36).slice(2, 10)}`,
          type: 'Franchise',
          title: cleanTitle,
          description: finalDescription,
          investment: investDisplay,
          investmentMin: investMin,
          investmentMax: investMax,
          image: finalImage,
          link,
          postedDate: 'Current listing',
          partners: `1/${maxPartners} partners`,
          source: 'canadafranchiseopportunities',
          liquidCapital: personalContribMatch ? `$${personalContribMatch[1].trim()}` : null,
          franchiseFee: null,
          totalInvestment: totalInvestMatch ? totalInvestMatch[0] : null,
          contact: {
            phone: contactPhone,
            email: contactEmail,
            website: contactWebsite,
          },
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