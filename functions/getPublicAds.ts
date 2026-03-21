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

    return Response.json({ ads: activeAds });
  } catch (error) {
    console.error("Error fetching public ads:", error);
    return Response.json({ ads: [] });
  }
});