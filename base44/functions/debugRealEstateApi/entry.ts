import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('RAPID_REAL_ESTATE_API');
    if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 });

    const location = 'Toronto, Ontario';
    const url = `https://realtor16.p.rapidapi.com/search/forsale?location=${encodeURIComponent(location)}&limit=3`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'realtor16.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
    });

    const data = await response.json();

    // Extract just the photo/image data from the first listing
    const listings = data?.properties || data?.data?.home_search?.results || data?.results || data?.data?.results || [];
    const firstListing = listings[0] || null;

    return Response.json({
      status: response.status,
      topLevelKeys: Object.keys(data),
      listingCount: listings.length,
      firstListingKeys: firstListing ? Object.keys(firstListing) : [],
      primaryPhoto: firstListing?.primary_photo,
      thumbnail: firstListing?.thumbnail,
      photosSample: (firstListing?.photos || []).slice(0, 3),
      photosType: typeof firstListing?.photos,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});