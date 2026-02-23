import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CACHE_TTL_DAYS = 30;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const apiKey = Deno.env.get('RAPID_REAL_ESTATE_API');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Fetch property listings across all of Canada using a wide bounding box
    const url = 'https://realtor-search.p.rapidapi.com/properties/search-by-coordinates';
    const params = new URLSearchParams({
      LatitudeMax: '83.0',
      LongitudeMax: '-52.0',
      LatitudeMin: '41.6',
      LongitudeMin: '-141.0',
      CurrentPage: '1',
      RecordsPerPage: '200',
      SortBy: '6',
      SortOrder: 'D',
      PropertyTypeGroupID: '1',
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'realtor-search.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    if (!response.ok) {
      return Response.json({ error: `API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const listings = data?.Results || [];

    const opportunities = listings.map((listing) => {
      const price = listing.Property?.Price || listing.Property?.PriceUnformatted
        ? `$${Number(listing.Property?.PriceUnformatted || 0).toLocaleString('en-CA')}`
        : 'Price on request';

      const address = listing.Property?.Address;
      const city = address?.City || '';
      const province = address?.Province || '';
      const streetAddress = address?.AddressText || '';
      const cleanAddress = streetAddress.replace(/\|.*$/, '').trim();

      const beds = listing.Building?.Bedrooms || '';
      const baths = listing.Building?.BathroomTotal || '';
      const buildingType = listing.Building?.Type || listing.Property?.Type || 'Property';

      const descParts = [];
      if (beds) descParts.push(`${beds} bed`);
      if (baths) descParts.push(`${baths} bath`);
      descParts.push(buildingType);
      if (cleanAddress) descParts.push(`at ${cleanAddress}`);
      if (city) descParts.push(city);
      if (province) descParts.push(province);

      const photos = (listing.Property?.Photo || []).map(p =>
        p.HighResPath || p.MedResPath || p.LowResPath
      ).filter(Boolean);

      const photo = photos[0] || null;

      let postedDate = 'Recently listed';
      const ticks = listing.InsertedDateUTC;
      if (ticks) {
        const tickNumber = typeof ticks === 'string' ? parseInt(ticks.replace(/\D/g, ''), 10) : ticks;
        const unixMs = (tickNumber - 621355968000000000) / 10000;
        const date = new Date(unixMs);
        if (!isNaN(date.getTime())) {
          postedDate = date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
        }
      }

      const mls = listing.MlsNumber || listing.Id || '';
      const location = [city, province].filter(Boolean).join(', ') || 'Canada';
      const title = `${buildingType} - ${location}${mls ? ` (MLS# ${mls})` : ''}`;

      const maxPartners = Math.floor(Math.random() * 20) + 5;

      // Extract agent/office contact info
      const agent = listing.Individual?.[0] || null;
      const agentName = agent ? [agent.Name?.FirstName, agent.Name?.LastName].filter(Boolean).join(' ') : null;
      const agentEmail = agent?.Emails?.[0]?.ContactId || agent?.EmailAddresses?.[0] || null;
      const agentPhone = agent?.PhoneNumbers?.[0]?.PhoneNumber || agent?.Phones?.[0]?.PhoneNumber || null;
      const agentWebsite = agent?.WebsiteURL || listing.Office?.Website || null;
      const officeName = listing.Office?.Name || null;

      return {
        id: String(listing.Id || listing.MlsNumber || Math.random()),
        type: 'Real Estate',
        title,
        investment: price,
        description: descParts.join(', '),
        image: photo,
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
        _sortDate: listing.InsertedDateUTC
          ? (typeof listing.InsertedDateUTC === 'string'
            ? parseInt(listing.InsertedDateUTC.replace(/\D/g, ''), 10)
            : listing.InsertedDateUTC)
          : 0,
      };
    });

    // Sort by most recent first
    opportunities.sort((a, b) => b._sortDate - a._sortDate);
    opportunities.forEach(o => delete o._sortDate);

    // Delete old cache records and store fresh data
    const fetchedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const oldCaches = await base44.asServiceRole.entities.RealEstateCache.list('-created_date', 10);
    for (const old of oldCaches) {
      await base44.asServiceRole.entities.RealEstateCache.delete(old.id);
    }

    await base44.asServiceRole.entities.RealEstateCache.create({
      opportunities,
      fetched_at: fetchedAt,
      expires_at: expiresAt,
    });

    return Response.json({
      success: true,
      count: opportunities.length,
      fetchedAt,
      cachedUntil: expiresAt,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});