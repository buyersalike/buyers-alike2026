import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Upgrades Realtor.com CDN image URLs from thumbnail (s.jpg) to high-res (od.jpg)
// URL pattern example: https://ap.rdcpix.com/abc123l-m1234567890s.jpg  → ...od.jpg
function upgradeUrl(url) {
  if (!url) return null;
  // Match the size suffix: a single lowercase letter immediately before .jpg
  // e.g. s.jpg, b.jpg, m.jpg, t.jpg, f.jpg, i.jpg → od.jpg
  return url.replace(/[a-z](\.jpg)(\?.*)?$/i, 'od$1');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const caches = await base44.asServiceRole.entities.RealEstateCache.list('-created_date', 5);
    if (!caches.length) return Response.json({ message: 'No cache found' });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const cache of caches) {
      const opportunities = cache.opportunities || [];
      let changed = false;

      const updated = opportunities.map(opp => {
        const newImage = upgradeUrl(opp.image);
        const newImages = (opp.images || []).map(upgradeUrl).filter(Boolean);

        if (newImage !== opp.image || JSON.stringify(newImages) !== JSON.stringify(opp.images)) {
          changed = true;
          updatedCount++;
          return { ...opp, image: newImage, images: newImages };
        }
        skippedCount++;
        return opp;
      });

      if (changed) {
        await base44.asServiceRole.entities.RealEstateCache.update(cache.id, {
          opportunities: updated,
        });
      }
    }

    // Return a sample of what images look like now
    const freshCache = await base44.asServiceRole.entities.RealEstateCache.list('-created_date', 1);
    const sampleImages = (freshCache[0]?.opportunities || []).slice(0, 3).map(o => o.image);

    return Response.json({ success: true, updatedCount, skippedCount, sampleImages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});