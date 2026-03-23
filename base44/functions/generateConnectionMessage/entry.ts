import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserEmail } = body;

    if (!targetUserEmail) {
      return Response.json({ error: 'targetUserEmail is required' }, { status: 400 });
    }

    // Fetch both users' profiles and interests in parallel
    const [senderProfileArr, targetProfileArr, senderInterests, targetInterests] = await Promise.all([
      base44.entities.User.filter({ email: user.email }),
      base44.entities.User.filter({ email: targetUserEmail }),
      base44.entities.Interest.filter({ user_email: user.email, status: 'approved' }),
      base44.entities.Interest.filter({ user_email: targetUserEmail, status: 'approved' }),
    ]);

    const senderProfile = senderProfileArr[0] || {};
    const targetProfile = targetProfileArr[0] || {};

    const senderContext = {
      name: user.full_name,
      title: senderProfile.title || senderProfile.profession || '',
      bio: senderProfile.bio || '',
      location: senderProfile.location || '',
      interests: senderInterests.map(i => i.interest_name),
    };

    const targetContext = {
      name: targetProfile.full_name || targetUserEmail,
      title: targetProfile.title || targetProfile.profession || '',
      bio: targetProfile.bio || '',
      location: targetProfile.location || '',
      interests: targetInterests.map(i => i.interest_name),
    };

    const sharedInterests = senderContext.interests.filter(i =>
      targetContext.interests.some(ti => ti.toLowerCase() === i.toLowerCase())
    );

    const prompt = `You are a professional networking assistant. Write a warm, personalized, and concise connection request message (max 3 sentences) from ${senderContext.name} to ${targetContext.name}.

SENDER PROFILE:
- Name: ${senderContext.name}
- Title/Profession: ${senderContext.title || 'Professional'}
- Location: ${senderContext.location || 'Not specified'}
- Interests: ${senderContext.interests.join(', ') || 'General business'}
- Bio: ${senderContext.bio || 'Not provided'}

TARGET PROFILE:
- Name: ${targetContext.name}
- Title/Profession: ${targetContext.title || 'Professional'}
- Location: ${targetContext.location || 'Not specified'}
- Interests: ${targetContext.interests.join(', ') || 'General business'}
- Bio: ${targetContext.bio || 'Not provided'}

SHARED INTERESTS: ${sharedInterests.length > 0 ? sharedInterests.join(', ') : 'None explicitly listed, use general business networking context'}

Write the message in first person from ${senderContext.name}'s perspective. Be genuine, reference specific shared interests or complementary skills if relevant. Keep it under 60 words.

Return ONLY valid JSON: { "message": "the connection request message" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional networking assistant. Always return valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content);

    return Response.json({
      success: true,
      message: result.message,
      sharedInterests,
    });

  } catch (error) {
    console.error('Error generating connection message:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});