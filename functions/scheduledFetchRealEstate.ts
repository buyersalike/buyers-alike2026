import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CACHE_TTL_DAYS = 30;

// Canadian cities to search across (using full province names for Realtor.com format)
const CANADIAN_LOCATIONS = [
  'Toronto, Ontario',
  'Vancouver, British Columbia',
  'Calgary, Alberta',
  'Ottawa, Ontario',
  'Edmonton, Alberta',
  'Mississauga, Ontario',
  'Winnipeg, Manitoba',
  'Hamilton, Ontario',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const apiKey = Deno.env.get('RAPID_REAL_ESTATE_API');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const allOpportunities = [];
    const seenIds = new Set();

    // Fetch from multiple Canadian cities
    for (const location of CANADIAN_LOCATIONS) {
      const url = `https://realtor16.p.rapidapi.com/search/forsale?location=${encodeURIComponent(location)}&limit=10&sort=newest`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'realtor16.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      });

      if (!response.ok) {
        console.log(`Failed for ${location}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const listings = data?.data?.home_search?.results || data?.results || [];

      for (const listing of listings) {
        const propId = listing?.property_id || listing?.listing_id || String(Math.random());
        if (seenIds.has(propId)) continue;
        seenIds.add(propId);

        const loc = listing?.location?.address || {};
        const city = loc.city || '';
        const state = loc.state_code || loc.state || '';
        const streetAddress = [loc.line, loc.unit].filter(Boolean).join(' ');

        const details = listing?.description || {};
        const beds = details.beds || '';
        const baths = details.baths || '';
        const buildingType = details.type || listing?.list_price_min ? 'Condo' : 'Property';
        const sqft = details.sqft || '';

        const priceRaw = listing?.list_price || listing?.price || 0;
        const price = priceRaw ? `$${Number(priceRaw).toLocaleString('en-CA')}` : 'Price on request';

        const descParts = [];
        if (beds) descParts.push(`${beds} bed`);
        if (baths) descParts.push(`${baths} bath`);
        if (sqft) descParts.push(`${Number(sqft).toLocaleString()} sqft`);
        if (buildingType) descParts.push(buildingType);
        if (streetAddress) descParts.push(`at ${streetAddress}`);
        if (city) descParts.push(city);
        if (state) descParts.push(state);

        // Photos
        const photos = (listing?.photos || []).map(p => p?.href || p?.url).filter(Boolean);
        const primaryPhoto = listing?.primary_photo?.href || listing?.thumbnail || photos[0] || null;

        // Date
        let postedDate = 'Recently listed';
        const listedDate = listing?.list_date || listing?.last_update_date;
        if (listedDate) {
          const d = new Date(listedDate);
          if (!isNaN(d.getTime())) {
            postedDate = d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
          }
        }

        const locationStr = [city, state].filter(Boolean).join(', ') || 'Canada';
        const title = `${buildingType} - ${locationStr}`;

        // Agent info
        const agent = listing?.advertisers?.[0] || listing?.agents?.[0] || null;
        const agentName = agent?.name || agent?.full_name || null;
        const agentEmail = agent?.email || null;
        const agentPhone = agent?.phones?.[0]?.number || agent?.phone || null;
        const agentWebsite = agent?.href || null;
        const officeName = listing?.branding?.[0]?.name || agent?.office?.name || null;

        const maxPartners = Math.floor(Math.random() * 20) + 5;

        allOpportunities.push({
          id: propId,
          type: 'Real Estate',
          title,
          investment: price,
          description: descParts.join(', '),
          image: primaryPhoto,
          images: photos,
          postedDate,
          partners: `1/${maxPartners} partners`,
          contact: {
            name: agentName,
            email: agentEmail,
            phone: agentPhone,
            website: agentWebsite,
            office: officeName,
          },
          _listedDate: listedDate || '',
        });
      }
    }

    if (allOpportunities.length === 0) {
      return Response.json({ error: 'No listings found from API' }, { status: 500 });
    }

    // Sort by most recent first
    allOpportunities.sort((a, b) => {
      if (!a._listedDate && !b._listedDate) return 0;
      if (!a._listedDate) return 1;
      if (!b._listedDate) return -1;
      return new Date(b._listedDate) - new Date(a._listedDate);
    });
    allOpportunities.forEach(o => delete o._listedDate);

    // Delete old caches and store fresh data
    const fetchedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const oldCaches = await base44.asServiceRole.entities.RealEstateCache.list('-created_date', 10);
    for (const old of oldCaches) {
      await base44.asServiceRole.entities.RealEstateCache.delete(old.id);
    }

    await base44.asServiceRole.entities.RealEstateCache.create({
      opportunities: allOpportunities,
      fetched_at: fetchedAt,
      expires_at: expiresAt,
    });

    return Response.json({
      success: true,
      count: allOpportunities.length,
      fetchedAt,
      cachedUntil: expiresAt,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});