import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goals, target_audience, budget, duration_months, business_type } = await req.json();

    // Get user's vendor profile for context
    const vendorApps = await base44.entities.VendorApplication.filter({ 
      user_email: user.email,
      status: 'approved'
    });

    const vendorProfile = vendorApps.length > 0 ? vendorApps[0] : null;

    // Create context
    const campaignContext = {
      user_name: user.full_name,
      business_name: vendorProfile?.business_name || user.business_name,
      business_category: vendorProfile?.category,
      tagline: vendorProfile?.tagline,
      description: vendorProfile?.description,
      unique_value: vendorProfile?.unique_value,
      goals,
      target_audience,
      budget,
      duration_months,
      business_type
    };

    // Use AI to generate comprehensive campaign details
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{
        role: 'user',
        content: `You are an expert digital advertising strategist. Help create a compelling ad campaign for this business.

Campaign Context:
${JSON.stringify(campaignContext, null, 2)}

Your Task:
1. Write a compelling campaign description (2-3 paragraphs) explaining:
   - Campaign objectives and value proposition
   - Target audience alignment
   - Expected outcomes
   
2. Generate 3 ad copy variations (each 50-80 words):
   - Variation A: Emotion-focused
   - Variation B: Feature-focused  
   - Variation C: Urgency-focused
   Each with a strong call-to-action
   
3. Suggest optimal targeting parameters:
   - Age range
   - Geographic focus
   - Interest categories
   - Behavioral targeting
   - Device preferences
   
4. Estimate realistic campaign ROI based on:
   - Industry benchmarks
   - Budget allocation
   - Duration
   - Target audience size
   
5. Recommend the best package tier (basic, premium, or enterprise) and why

6. Suggest key performance indicators (KPIs) to track

Make recommendations data-driven, professional, and actionable.`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    const aiResponse = JSON.parse(response.choices[0].message.content);

    return Response.json({
      success: true,
      ...aiResponse
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});