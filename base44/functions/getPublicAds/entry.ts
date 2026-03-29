import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    // Fetch all approved vendors to get their websites
    const vendors = await base44.asServiceRole.entities.VendorApplication.filter({ status: 'approved' });
    
    // Build lookup maps: by vendor_id AND by user_email
    const websiteByVendorId = {};
    const websiteByEmail = {};
    vendors.forEach(v => {
      if (v.website) {
        if (v.vendor_id) websiteByVendorId[v.vendor_id] = v.website;
        if (v.user_email) websiteByEmail[v.user_email] = v.website;
      }
    });

    const adsWithWebsites = activeAds.map(ad => ({
      ...ad,
      website: websiteByVendorId[ad.vendor_id] || websiteByEmail[ad.user_email] || ''
    }));

    return Response.json({ ads: adsWithWebsites });
  } catch (error) {
    console.error("Error fetching public ads:", error);
    return Response.json({ ads: [] });
  }
});