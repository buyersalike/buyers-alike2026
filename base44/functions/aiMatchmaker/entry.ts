import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Fetch user's interests
    const myInterests = await base44.entities.Interest.filter({ 
      user_email: user.email,
      status: 'approved'
    });

    const myInterestNames = myInterests.map(i => i.interest_name);

    if (myInterestNames.length === 0) {
      return Response.json({
        success: false,
        error: 'Please add at least one interest to your profile before generating matches.'
      });
    }

    // Fetch all users and all approved interests
    const [allUsers, allInterests] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Interest.filter({ status: 'approved' })
    ]);

    // Build interest map: email -> [interest names]
    const interestsByUser = {};
    allInterests.forEach(interest => {
      if (!interestsByUser[interest.user_email]) {
        interestsByUser[interest.user_email] = [];
      }
      interestsByUser[interest.user_email].push(interest.interest_name);
    });

    // Filter out current user, keep only users with at least one interest
    const candidates = allUsers
      .filter(u => u.email !== user.email && interestsByUser[u.email]?.length > 0)
      .slice(0, 50);

    if (candidates.length === 0) {
      return Response.json({
        success: true,
        matches: []
      });
    }

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{
        role: 'user',
        content: `You are an expert business matchmaker. Match this user with compatible partners based on shared interests, expertise, and potential for collaboration.

Current User:
- Name: ${user.full_name}
- Title: ${user.title || 'N/A'}
- Bio: ${user.bio || 'N/A'}
- Location: ${user.location || 'N/A'}
- Interests: ${myInterestNames.join(', ')}

Potential Partners:
${JSON.stringify(candidates.map(u => ({
  email: u.email,
  name: u.full_name,
  title: u.title || '',
  bio: u.bio || '',
  location: u.location || '',
  interests: interestsByUser[u.email] || []
})), null, 2)}

Return a JSON object with a "matches" array. Each match must have:
- "email": partner email (exact match from the list)
- "name": partner name
- "match_score": number 0-100
- "overview": 1-2 sentence explanation of why they match

IMPORTANT: Only include matches with score >= 80. Be strict — a match below 80 should not be returned.
Sort by match_score descending. Include up to 10 matches.`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const aiResult = JSON.parse(response.choices[0].message.content);
    const matches = aiResult.matches || aiResult.results || aiResult.recommendations || [];

    // Normalize match data
    const normalizedMatches = matches.map(m => ({
      email: m.email || m.partner_email || '',
      name: m.name || m.partner_name || '',
      match_score: m.match_score || m.confidence_score || m.score || 0,
      overview: m.overview || m.explanation || m.reason || ''
    })).filter(m => m.email && m.match_score >= 80);

    return Response.json({
      success: true,
      matches: normalizedMatches
    });

  } catch (error) {
    console.error('aiMatchmaker error:', error.message);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});