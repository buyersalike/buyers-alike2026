import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, action } = await req.json();

    if (action === 'delete') {
      await base44.asServiceRole.entities.Opportunity.delete(id);
      return Response.json({ success: true, action: 'deleted' });
    }

    if (!status) {
      return Response.json({ error: 'Missing status' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Opportunity.update(id, { status });
    return Response.json({ success: true, status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});