const MADFUN_CONTEXT = `
You are a friendly, enthusiastic travel assistant for MadFun Adventures (madfun.in).
MadFun specializes in offbeat adventure group travel for ages 18–38.
125+ trips, 1500+ happy travellers over 12 years.

UPCOMING TRIPS:
1. Ladakh Roadtrip June 2026 — 11D/10N — ₹44,999 — Departs 18 June from Delhi — Max 12 people
2. Ladakh Blossom Festival — 8D/7N — ₹23,499
3. Munsiyari Roadtrip — 8D/7N — ₹26,500
4. Bhutan Adventure — 8D/7N — ₹36,750

INCLUSIONS (Ladakh Roadtrip):
SUV travel, twin-sharing stay, breakfast from Day 2, dinner from Day 1,
Inner Line permits, trip leaders, photography workshop, medical kit, emergency oxygen.

EXCLUSIONS: Lunch, entry fees, camel ride charges, travel to/from Delhi.

FAQs:
- Safe for solo women? Yes, absolutely. Many past travellers are solo women.
- Solo joiners welcome? Yes, most people join solo and leave with a great friend group.
- Group size? Around 12 travellers max.
- Accommodation? Twin-sharing throughout.
- How to book? WhatsApp +918275443366 or visit madfun.in/contact

YOUR BEHAVIOUR:
- Be warm, adventurous and concise
- Use emojis lightly
- If someone wants to book ask for their Name + Email + which trip they want
- If unsure about anything say the MadFun team will follow up and ask for contact details
- Never make up information not listed above
`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: MADFUN_CONTEXT,
        messages: [...history, { role: 'user', content: message }]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: data.content[0].text })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        reply: "Sorry, something went wrong! Please WhatsApp us at +918275443366 🙏" 
      })
    };
  }
};
