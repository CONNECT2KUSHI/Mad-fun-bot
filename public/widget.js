(function () {
  const API_URL = 'https://elegant-heliotrope-aa39f8.netlify.app/.netlify/functions/chat';
  let history = [];

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #mf-btn {
      position:fixed; bottom:24px; right:24px; width:58px; height:58px;
      background:linear-gradient(135deg,#FF4500,#FF8C00);
      border-radius:50%; cursor:pointer; display:flex;
      align-items:center; justify-content:center;
      font-size:24px; box-shadow:0 4px 20px rgba(255,107,0,0.5);
      z-index:999999; border:none; transition:transform .2s;
    }
    #mf-btn:hover { transform:scale(1.1); }
    #mf-box {
      display:none; flex-direction:column; position:fixed;
      bottom:95px; right:24px; width:320px; height:460px;
      background:#fff; border-radius:20px; overflow:hidden;
      box-shadow:0 10px 40px rgba(0,0,0,0.2);
      z-index:999999; font-family:sans-serif;
    }
    #mf-head {
      background:linear-gradient(135deg,#FF4500,#FF8C00);
      padding:14px 16px; color:white;
    }
    #mf-head h4 { margin:0; font-size:15px; }
    #mf-head p {
      margin:3px 0 0; font-size:11px; opacity:.85;
      display:flex; align-items:center; gap:5px;
    }
    #mf-msgs {
      flex:1; overflow-y:auto; padding:14px;
      display:flex; flex-direction:column;
      gap:10px; background:#f8f8f8;
    }
    .mf-bot, .mf-user {
      max-width:82%; padding:10px 13px;
      border-radius:14px; font-size:13px; line-height:1.5;
    }
    .mf-bot {
      background:white; border:1px solid #eee;
      border-radius:4px 14px 14px 14px; align-self:flex-start;
      color:#333;
    }
    .mf-user {
      background:linear-gradient(135deg,#FF4500,#FF8C00);
      color:white; border-radius:14px 14px 4px 14px;
      align-self:flex-end;
    }
    #mf-foot {
      padding:10px; border-top:1px solid #eee;
      display:flex; gap:8px; background:white;
    }
    #mf-in {
      flex:1; padding:9px 13px; border:1.5px solid #eee;
      border-radius:16px; font-size:13px; outline:none;
      transition:border .2s;
    }
    #mf-in:focus { border-color:#FF6B00; }
    #mf-go {
      width:38px; height:38px;
      background:linear-gradient(135deg,#FF4500,#FF8C00);
      border:none; border-radius:50%; color:white;
      font-size:16px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  document.body.insertAdjacentHTML('beforeend', `
    <button id="mf-btn">✈️</button>
    <div id="mf-box">
      <div id="mf-head">
        <h4>🏔️ MadFun Assistant</h4>
        <p>
          <span style="width:7px;height:7px;background:#7FFF00;
            border-radius:50%;display:inline-block;
            box-shadow:0 0 5px #7FFF00">
          </span>
          Online · Replies instantly
        </p>
      </div>
      <div id="mf-msgs">
        <div class="mf-bot">
          Hey adventurer! 👋 Ask me anything about 
          our Ladakh, Bhutan or Munsiyari trips! 🏔️
        </div>
      </div>
      <div id="mf-foot">
        <input id="mf-in" placeholder="Ask about trips, pricing..."/>
        <button id="mf-go">➤</button>
      </div>
    </div>
  `);

  // Toggle open/close
  document.getElementById('mf-btn').onclick = () => {
    const box = document.getElementById('mf-box');
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
  };

  // Send message
  async function send() {
    const input = document.getElementById('mf-in');
    const msgs = document.getElementById('mf-msgs');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    msgs.innerHTML += `<div class="mf-user">${text}</div>`;
    msgs.innerHTML += `<div class="mf-bot" id="mf-typing">Typing...</div>`;
    msgs.scrollTop = msgs.scrollHeight;

    history.push({ role: 'user', content: text });

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          history: history.slice(-8) 
        })
      });
      const data = await res.json();
      document.getElementById('mf-typing')?.remove();
      msgs.innerHTML += `<div class="mf-bot">${data.reply}</div>`;
      history.push({ role: 'assistant', content: data.reply });
    } catch {
      document.getElementById('mf-typing')?.remove();
      msgs.innerHTML += `<div class="mf-bot">
        Try WhatsApp: +918275443366 🙏
      </div>`;
    }

    msgs.scrollTop = msgs.scrollHeight;
  }

  document.getElementById('mf-go').onclick = send;
  document.getElementById('mf-in').onkeypress = (e) => {
    if (e.key === 'Enter') send();
  };
})();