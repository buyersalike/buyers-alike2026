import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Always serve from cache — data is refreshed daily by the scheduled automation
    const cacheRecords = await base44.asServiceRole.entities.RealEstateCache.list('-created_date', 1);

    if (!cacheRecords || cacheRecords.length === 0) {
      return Response.json({
        success: true,
        opportunities: [],
        count: 0,
        source: 'cache_empty',
      });
    }

    const cache = cacheRecords[0];

    return Response.json({
      success: true,
      opportunities: cache.opportunities,
      count: cache.opportunities.length,
      fetchedAt: cache.fetched_at,
      cachedUntil: cache.expires_at,
      source: 'cache',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});