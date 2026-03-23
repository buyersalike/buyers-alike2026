import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, action, data } = await req.json();

    if (action === 'delete') {
      await base44.asServiceRole.entities.Interest.delete(id);
      return Response.json({ success: true, action: 'deleted' });
    }

    if (action === 'update') {
      await base44.asServiceRole.entities.Interest.update(id, data);
      return Response.json({ success: true, action: 'updated' });
    }

    if (action === 'create') {
      const created = await base44.asServiceRole.entities.Interest.create(data);
      return Response.json({ success: true, record: created });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});