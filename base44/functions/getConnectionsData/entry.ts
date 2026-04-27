import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to fetch all users and connections (bypasses User entity security rules)
    const [allUsers, allConnections] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Connection.list(),
    ]);

    // Return safe user fields only (no sensitive data)
    const safeUsers = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      avatar_url: u.avatar_url,
      occupation: u.occupation,
      business_name: u.business_name,
      overview: u.overview,
      location: u.location,
      province: u.province,
    }));

    return Response.json({ users: safeUsers, connections: allConnections });
  } catch (error) {
    console.error('getConnectionsData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});