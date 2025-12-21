import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, industry, budget, goal } = await req.json();

    // Get user's interests for better context
    const interests = await base44.entities.Interest.filter({ 
      user_email: user.email,
      status: 'approved'
    });

    // Fetch available categories for tag suggestions
    const categories = await base44.entities.Category.list();

    // Create user context
    const userContext = {
      name: user.full_name,
      title: user.title,
      bio: user.bio,
      location: user.location,
      occupation: user.occupation,
      business_name: user.business_name,
      interests: interests.map(i => i.interest_name)
    };

    // Use AI to generate comprehensive opportunity details
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert business opportunity consultant. A user wants to create a new opportunity listing and needs your help to make it compelling and complete.

User Profile:
${JSON.stringify(userContext, null, 2)}

User's Input:
- Title/Goal: ${title}
- Industry: ${industry || 'Not specified'}
- Budget: ${budget || 'Not specified'}
- Additional Goal Details: ${goal || 'Not specified'}

Available Categories: ${categories.map(c => c.name).join(', ')}

Your Task:
1. Write a compelling, detailed description (3-4 paragraphs) that includes:
   - Overview of the opportunity
   - Key benefits and value proposition
   - Strategic advantages
   - What makes this opportunity unique
   
2. Suggest the most relevant category from the available list

3. Estimate a realistic investment/deal range in format "$$X - $$Y" (e.g., "$500K - $1M", "$2M - $5M", "$10M+")

4. Suggest 3-5 relevant tags that would help others discover this opportunity

5. Identify 3-4 strategic alignments or market trends that make this opportunity timely

6. Suggest a partnership type (e.g., "Joint Venture", "Acquisition", "Investment", "Strategic Partnership", "Merger")

Make the opportunity sound professional, exciting, and actionable while remaining realistic and credible.`,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          category: { type: "string" },
          investment_range: { type: "string" },
          suggested_tags: {
            type: "array",
            items: { type: "string" }
          },
          strategic_alignments: {
            type: "array",
            items: { type: "string" }
          },
          partnership_type: { type: "string" },
          market_insights: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      ...aiResponse
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});