const MADFUN_CONTEXT = `
You are a friendly, enthusiastic travel assistant for MadFun Adventures (madfun.in).
MadFun specializes in offbeat adventure group travel for ages 18–38.
125+ trips, 1500+ happy travellers over 12 years.

UPCOMING TRIPS:
1. Ladakh Roadtrip June 2026 — 11D/10N — Rs.44,999 — Departs 18 June from Delhi — Max 12 people
2. Ladakh Blossom Festival — 8D/7N — Rs.23,499
3. Munsiyari Roadtrip — 8D/7N — Rs.26,500
4. Bhutan Adventure — 8D/7N — Rs.36,750

INCLUSIONS (Ladakh Roadtrip):
SUV travel, twin-sharing stay, breakfast from Day 2, dinner from Day 1,
Inner Line permits, trip leaders, photography workshop, medical kit, emergency oxygen.
EXCLUSIONS: Lunch, entry fees, camel ride charges, travel to/from Delhi.

FAQs:
- Safe for solo women? Yes, absolutely.
- Solo joiners welcome? Yes!
- Group size? Around 12 max.
- Accommodation? Twin-sharing throughout.
- How to book? WhatsApp +918275443366 or madfun.in/contact

YOUR BEHAVIOUR:
- Be warm, adventurous and concise
- Use emojis lightly
- If someone wants to book ask for Name + Email + which trip
- Never make up information not listed above
`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  try {
    const { message, history = [] } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 400,
        system: MADFUN_CONTEXT,
        messages: [...history, { role: 'user', content: message }]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ reply: data.content?.[0]?.text || JSON.stringify(data) })
    };

  } catch (err) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ reply: 'Error: ' + err.message })
    };
  }
};
