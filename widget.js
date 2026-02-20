(() => {
  const script = document.currentScript || [...document.scripts].slice(-1)[0];

  // Hills & Partners 固定Webhook
  const WEBHOOK = "https://nextasia.app.n8n.cloud/webhook/b4fcdd4d-5df4-4b5f-8e25-a85fbcd2cdb5";

  const TITLE = script?.dataset?.title || "Hills & Partners AI";
  const ACCENT = script?.dataset?.accent || "#00E5FF";
  const ACCENT2 = script?.dataset?.accent2 || "#B100FF";

  const KEY = "hills_ai_widget_session_id";
  let sessionId = localStorage.getItem(KEY);
  if (!sessionId) {
    sessionId = (crypto?.randomUUID?.() || String(Date.now())).toString();
    localStorage.setItem(KEY, sessionId);
  }

  const launcher = document.createElement("button");
  launcher.id = "aiLauncherBtn";
  launcher.type = "button";
  launcher.innerHTML = `
    <span class="aiDot"></span>
    <span class="aiLauncherText">AIに質問する</span>
    <span class="aiLauncherHint">クリックで起動</span>
  `;
  document.body.appendChild(launcher);

  const box = document.createElement("div");
  box.id = "aiWidgetBox";
  box.innerHTML = `
    <div class="aiHead">
      <div class="aiBrand">
        <div class="aiTitle">${TITLE}</div>
        <div class="aiSub">Hills & Partners // AI Assistant</div>
      </div>
      <button id="aiWidgetClose" class="aiX" aria-label="close">×</button>
    </div>

    <div class="aiLog" id="aiWidgetLog"></div>

    <div class="aiRow">
      <input id="aiWidgetInput" placeholder="ご質問を入力してください…" />
      <button id="aiWidgetSend">送信</button>
    </div>
  `;
  document.body.appendChild(box);

  const style = document.createElement("style");
  style.textContent = `
:root{
  --ai-accent:${ACCENT};
  --ai-accent2:${ACCENT2};
  --ai-text:rgba(245,245,255,.92);
  --ai-muted:rgba(200,210,255,.70);
  --ai-shadow:0 18px 60px rgba(0,0,0,.55);
  --ai-radius:18px;
}
#aiLauncherBtn{
  position:fixed; right:18px; bottom:18px;
  width:min(360px, calc(100vw - 36px));
  height:54px;
  z-index:999999;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(12,16,28,.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 0 0 1px rgba(0,229,255,.10), 0 0 30px rgba(0,229,255,.16), var(--ai-shadow);
  display:flex; align-items:center; gap:10px;
  padding: 10px 14px;
  cursor:pointer;
  color: var(--ai-text);
  overflow:hidden;
}
#aiLauncherBtn::before{
  content:"";
  position:absolute; inset:-2px;
  background: radial-gradient(60% 120% at 10% 50%, rgba(0,229,255,.25), transparent 60%),
              radial-gradient(60% 120% at 90% 50%, rgba(177,0,255,.18), transparent 60%);
  pointer-events:none;
}
#aiLauncherBtn .aiDot{
  width:10px; height:10px; border-radius:999px;
  background: linear-gradient(135deg, rgba(0,229,255,.95), rgba(177,0,255,.85));
  box-shadow: 0 0 18px rgba(0,229,255,.55);
  flex:0 0 auto;
}
#aiLauncherBtn .aiLauncherText{
  font-weight:800;
  letter-spacing:.06em;
  white-space:nowrap;
}
#aiLauncherBtn .aiLauncherHint{
  margin-left:auto;
  font-size:12px;
  color: var(--ai-muted);
  letter-spacing:.08em;
}
#aiLauncherBtn:hover{
  border-color: rgba(0,229,255,.35);
  box-shadow: 0 0 0 1px rgba(0,229,255,.18), 0 0 46px rgba(0,229,255,.22), var(--ai-shadow);
}
#aiWidgetBox{
  position:fixed; right:18px; bottom:82px;
  width:390px; max-width:92vw;
  height:560px; max-height:72vh;
  display:none; overflow:hidden;
  z-index:999999;
  color: var(--ai-text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
  background: linear-gradient(180deg, rgba(12,16,28,.82), rgba(10,12,20,.72));
  border-radius: var(--ai-radius);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: 0 0 0 1px rgba(0,229,255,.10), 0 0 40px rgba(0,229,255,.18), 0 0 70px rgba(177,0,255,.12), var(--ai-shadow);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.aiHead{
  padding:12px 12px;
  background: linear-gradient(180deg, rgba(0,229,255,.08), rgba(177,0,255,.03));
  border-bottom: 1px solid rgba(255,255,255,.08);
  display:flex; align-items:center; justify-content:space-between;
  gap:10px;
}
.aiBrand{ display:flex; flex-direction:column; gap:4px; min-width:0; }
.aiTitle{
  font-weight: 800; letter-spacing: .08em; font-size: 14px;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(0,229,255,.35);
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.aiSub{
  font-size: 11px; color: var(--ai-muted);
  letter-spacing: .12em; opacity: .9;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.aiX{
  width:36px; height:36px;
  border:none; background: rgba(0,0,0,.18);
  color: rgba(245,245,255,.85);
  border-radius:12px;
  border: 1px solid rgba(255,255,255,.10);
  display:flex; align-items:center; justify-content:center;
  font-size:20px; line-height:1;
  cursor:pointer;
}
.aiLog{
  padding:14px;
  height: calc(100% - 122px);
  overflow:auto;
  overscroll-behavior: contain;
}
.aiMsg{ margin:12px 0; display:flex; }
.aiMsg.user{ justify-content:flex-end; }
.aiBubble{
  max-width:78%;
  padding:10px 12px;
  border-radius: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
}
.aiMsg.user .aiBubble{
  border: 1px solid rgba(0,229,255,.25);
  background: linear-gradient(135deg, rgba(0,229,255,.22), rgba(177,0,255,.14));
}
.aiRow{
  display:flex; gap:10px;
  padding:12px 12px;
  border-top: 1px solid rgba(255,255,255,.08);
  background: rgba(0,0,0,.14);
}
#aiWidgetInput{
  flex:1;
  padding:10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.10);
  outline:none;
  background: rgba(8,10,16,.55);
  color: var(--ai-text);
}
#aiWidgetSend{
  padding:10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.10);
  cursor:pointer;
  color: rgba(245,245,255,.95);
  background: linear-gradient(135deg, rgba(0,229,255,.45), rgba(177,0,255,.30));
}
@media (max-width: 520px){
  #aiWidgetBox{ right:12px; width: calc(100vw - 24px); }
  #aiLauncherBtn{ right:12px; width: calc(100vw - 24px); }
}
  `;
  document.head.appendChild(style);

  const log = box.querySelector("#aiWidgetLog");
  const input = box.querySelector("#aiWidgetInput");
  const send = box.querySelector("#aiWidgetSend");
  const close = box.querySelector("#aiWidgetClose");

  function addMsg(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "aiMsg " + (role === "user" ? "user" : "ai");
    const bub = document.createElement("div");
    bub.className = "aiBubble";
    bub.textContent = text;
    wrap.appendChild(bub);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return bub;
  }

  function openBox() {
    box.style.display = "block";
    launcher.style.opacity = "0.75";
  }
  function closeBox() {
    box.style.display = "none";
    launcher.style.opacity = "1";
  }

  launcher.addEventListener("click", () => {
    openBox();
    if (!log.dataset.booted) {
      log.dataset.booted = "1";
      addMsg("ai", "こんにちは。ご質問をどうぞ。");
    }
    input.focus();
  });

  close.onclick = closeBox;

  async function doSend() {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    addMsg("user", text);
    const pending = addMsg("ai", "…");

    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          page_url: location.href,
          ts: new Date().toISOString()
        })
      });

      const data = await res.json();
      pending.textContent =
        data.reply || data.output || data.text || "返答が空だ";
    } catch (e) {
      pending.textContent = "通信エラー。CORS(コルス)かWebhookだ。";
    }
  }

  send.onclick = doSend;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSend();
  });
})();
