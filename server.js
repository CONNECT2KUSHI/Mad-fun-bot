const http = require('http');
const https = require('https');

const SYSTEM = 'You are a helpful travel assistant for MadFun Adventures. Trips: 1) Ladakh Roadtrip June 2026, 11 days, Rs.44999. 2) Ladakh Blossom Festival, 8 days, Rs.23499. 3) Munsiyari Roadtrip, 8 days, Rs.26500. 4) Bhutan Adventure, 8 days, Rs.36750. Book via WhatsApp +918275443366. Be warm and concise.';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'GET') { res.writeHead(200); res.end('MadFun Bot running!'); return; }
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const { message, history = [] } = JSON.parse(body);
      const postData = JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 400,
        system: SYSTEM,
        messages: [...history, { role: 'user', content: message }]
      });
      const req2 = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (r) => {
        let data = '';
        r.on('data', c => data += c);
        r.on('end', () => {
          const parsed = JSON.parse(data);
          const reply = parsed.content?.[0]?.text || JSON.stringify(parsed);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reply }));
        });
      });
      req2.on('error', e => { res.writeHead(200); res.end(JSON.stringify({ reply: e.message })); });
      req2.write(postData);
      req2.end();
    });
    return;
  }
  res.writeHead(404); res.end();
}).listen(process.env.PORT || 3000, () => console.log('Running!'));
