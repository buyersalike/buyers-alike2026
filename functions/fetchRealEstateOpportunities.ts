import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get('RAPID_REAL_ESTATE_API');
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Use the exact endpoint format from the curl example
    const response = await fetch(
      'https://realty-in-ca1.p.rapidapi.com/properties/get-statistics?Longitude=-79.38&CultureId=1&Latitude=43.65',
      {
        headers: {
          'x-rapidapi-host': 'realty-in-ca1.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: 'Failed to fetch real estate data', status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    if (!text) {
      return Response.json({ error: 'Empty response from API' }, { status: 500 });
    }

    const data = JSON.parse(text);

    // Transform the data into opportunity format
    const opportunities = [];
    
    if (data && data.Results) {
      data.Results.slice(0, 20).forEach((property) => {
        const price = property.Property?.Price;
        const partners = Math.floor(Math.random() * 20) + 1;
        
        opportunities.push({
          id: property.Id || `re-${Date.now()}-${Math.random()}`,
          type: 'Real Estate',
          title: `Single Family - ${property.Property?.Address?.City || 'Canada'} (MLS# ${property.MlsNumber || 'N/A'})`,
          investment: price 
            ? `$${price.toLocaleString()} - $${price.toLocaleString()}` 
            : 'Contact for pricing',
          description: `${property.Property?.Building?.BathroomTotal || '1'} bathroom, ${property.Property?.Building?.Type || 'Single Family'}, at ${property.Property?.Address?.AddressText || 'N/A'}|${property.Property?.Address?.City || 'N/A'}, ${property.Property?.Address?.Province || 'Canada'} ${property.Property?.Address?.Zip || ''}, wit...`,
          image: property.Property?.Photo?.[0]?.HighResPath || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
          postedDate: new Date(property.InsertedDateUTC || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          partners: `1/${partners} partners`,
        });
      });
    }

    return Response.json({ 
      success: true, 
      opportunities,
      count: opportunities.length 
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});