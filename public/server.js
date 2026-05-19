const http = require('http');
const https = require('https');

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
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Only handle POST /chat
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { message, history = [] } = JSON.parse(body);

        // Call Claude API
        const postData = JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 400,
          system: MADFUN_CONTEXT,
          messages: [...history, { role: 'user', content: message }]
        });

        const options = {
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const apiReq = https.request(options, (apiRes) => {
          let data = '';
          apiRes.on('data', chunk => data += chunk);
          apiRes.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              const reply = parsed.content?.[0]?.text || JSON.stringify(parsed);
              res.writeHead(200, CORS_HEADERS);
              res.end(JSON.stringify({ reply }));
            } catch (e) {
              res.writeHead(200, CORS_HEADERS);
              res.end(JSON.stringify({ reply: 'Parse error: ' + e.message }));
            }
          });
        });

        apiReq.on('error', (e) => {
          res.writeHead(200, CORS_HEADERS);
          res.end(JSON.stringify({ reply: 'API error: ' + e.message }));
        });

        apiReq.write(postData);
        apiReq.end();

      } catch (e) {
        res.writeHead(200, CORS_HEADERS);
        res.end(JSON.stringify({ reply: 'Error: ' + e.message }));
      }
    });
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('MadFun Bot is running!');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`MadFun bot running on port ${PORT}`);
});
