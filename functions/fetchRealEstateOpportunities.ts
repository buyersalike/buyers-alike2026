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

    // Coordinates for central Canada (approximate center)
    const response = await fetch(
      'https://realty-in-ca1.p.rapidapi.com/properties/get-statistics?Longitude=-95.0&Latitude=60.0&CultureId=1',
      {
        headers: {
          'x-rapidapi-host': 'realty-in-ca1.p.rapidapi.com',
          'x-rapidapi-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to fetch real estate data', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform the data into opportunity format
    const opportunities = [];
    
    if (data && data.Results) {
      data.Results.slice(0, 20).forEach((property) => {
        opportunities.push({
          id: property.Id || `re-${Date.now()}-${Math.random()}`,
          type: 'Real Estate',
          title: property.Property?.Address?.AddressText || 'Investment Property',
          investment: property.Property?.Price 
            ? `$${property.Property.Price.toLocaleString()}` 
            : 'Contact for pricing',
          description: `${property.Property?.Building?.Type || 'Property'} - ${property.Property?.Land?.SizeTotal || 'N/A'} sq ft. ${property.Property?.Building?.Bedrooms ? `${property.Property.Building.Bedrooms} beds, ` : ''}${property.Property?.Building?.BathroomTotal ? `${property.Property.Building.BathroomTotal} baths` : ''}`,
          location: `${property.Property?.Address?.City || ''}, ${property.Property?.Address?.Province || 'Canada'}`.trim(),
          image: property.Property?.Photo?.[0]?.HighResPath || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
          partners: Math.floor(Math.random() * 10) + 5,
          posted: new Date(property.InsertedDateUTC || Date.now()).toLocaleDateString(),
          featured: property.Property?.Price > 1000000,
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