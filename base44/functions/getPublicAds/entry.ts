import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role to fetch ads so unauthenticated users on the public landing page can see them
    const allAds = await base44.asServiceRole.entities.AdvertiseApplication.filter({
      status: "approved"
    });

    // Filter by expiry date
    const now = new Date();
    const activeAds = allAds.filter(ad => {
      if (!ad.expiry_date) return true;
      return new Date(ad.expiry_date) > now;
    });

    // Fetch vendor websites to attach to ads
    const vendorIds = [...new Set(activeAds.map(ad => ad.vendor_id).filter(Boolean))];
    let vendorMap = {};
    if (vendorIds.length > 0) {
      const vendors = await base44.asServiceRole.entities.VendorApplication.filter({ status: 'approved' });
      vendors.forEach(v => {
        vendorMap[v.vendor_id] = v.website || '';
      });
    }

    const adsWithWebsites = activeAds.map(ad => ({
      ...ad,
      website: vendorMap[ad.vendor_id] || ''
    }));

    return Response.json({ ads: adsWithWebsites });
  } catch (error) {
    console.error("Error fetching public ads:", error);
    return Response.json({ ads: [] });
  }
});