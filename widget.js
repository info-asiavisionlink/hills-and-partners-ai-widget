(() => {
  const script = document.currentScript || [...document.scripts].slice(-1)[0];
  const WEBHOOK = script?.dataset?.webhook || "";
  if (!WEBHOOK) return console.error("data-webhook がない");

  // ===== Brand Config =====
  const TITLE = script?.dataset?.title || "Hills & Partners AI";
  // コーポレートブルー寄り（必要ならdata-accentで差し替え）
  const ACCENT = script?.dataset?.accent || "#1E5AA8";
  const ACCENT2 = script?.dataset?.accent2 || "#2B7DE9"; // グラデ用
  const LOGO_URL = script?.dataset?.logo || ""; // 任意: data-logo="https://..."

  // Session
  const KEY = "hp_ai_widget_session_id";
  let sessionId = localStorage.getItem(KEY);
  if (!sessionId) {
    sessionId = (crypto?.randomUUID?.() || String(Date.now())).toString();
    localStorage.setItem(KEY, sessionId);
  }

  // ===== Launcher (Floating) =====
  const launcher = document.createElement("button");
  launcher.id = "hpAiLauncher";
  launcher.type = "button";
  launcher.innerHTML = `
    <span class="hpAiDot" aria-hidden="true"></span>
    <span class="hpAiLauncherText">AIに相談</span>
  `;
  document.body.appendChild(launcher);

  // ===== Widget Box =====
  const box = document.createElement("div");
  box.id = "hpAiBox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Hills & Partners AI Chat");
  box.innerHTML = `
    <div class="hpAiHead">
      <div class="hpAiBrand">
        ${LOGO_URL ? `<img class="hpAiLogo" src="${LOGO_URL}" alt="logo" />` : `<div class="hpAiLogoFallback" aria-hidden="true"></div>`}
        <div class="hpAiBrandText">
          <div class="hpAiTitle">${TITLE}</div>
          <div class="hpAiSub">Hills & Partners // AI Assistant</div>
        </div>
      </div>
      <button id="hpAiClose" class="hpAiClose" type="button" aria-label="close">×</button>
    </div>

    <div class="hpAiBody">
      <div class="hpAiLog" id="hpAiLog"></div>
      <div class="hpAiFooter">
        <input id="hpAiInput" type="text" placeholder="例：サービス内容を教えてください" />
        <button id="hpAiSend" type="button">送信</button>
      </div>
      <div class="hpAiFineprint">
        個人情報や機密情報は入力しないでください。必要に応じて担当者へ引き継ぎます。
      </div>
    </div>
  `;
  document.body.appendChild(box);

  // ===== CSS (White + Blue Corporate) =====
  const style = document.createElement("style");
  style.textContent = `
:root{
  --hp-accent: ${ACCENT};
  --hp-accent2: ${ACCENT2};
  --hp-bg: #ffffff;
  --hp-panel: #ffffff;
  --hp-text: #0f172a;   /* slate-900 */
  --hp-muted: #475569;  /* slate-600 */
  --hp-border: rgba(15, 23, 42, 0.12);
  --hp-shadow: 0 18px 60px rgba(15, 23, 42, 0.18);
  --hp-radius: 16px;
}

/* ===== Launcher ===== */
#hpAiLauncher{
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 999999;
  height: 48px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--hp-border);
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  color: var(--hp-text);
  box-shadow: var(--hp-shadow);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
}
#hpAiLauncher:hover{
  transform: translateY(-1px);
}
#hpAiLauncher:active{
  transform: translateY(0);
}
.hpAiDot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--hp-accent), var(--hp-accent2));
  box-shadow: 0 0 0 4px rgba(43, 125, 233, 0.16);
}
.hpAiLauncherText{
  font-weight: 800;
  letter-spacing: .02em;
}

/* ===== Box ===== */
#hpAiBox{
  position: fixed;
  right: 18px;
  bottom: 76px;
  width: 390px;
  max-width: calc(100vw - 36px);
  height: 560px;
  max-height: 78vh;
  background: var(--hp-panel);
  border: 1px solid var(--hp-border);
  border-radius: var(--hp-radius);
  box-shadow: var(--hp-shadow);
  overflow: hidden;
  display: none;
  z-index: 999999;
  color: var(--hp-text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", sans-serif;
}

/* ===== Header ===== */
.hpAiHead{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  background: linear-gradient(90deg, rgba(30, 90, 168, 0.10), rgba(43, 125, 233, 0.06));
  border-bottom: 1px solid var(--hp-border);
}
.hpAiBrand{
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.hpAiLogo{
  width: 30px;
  height: 30px;
  border-radius: 10px;
  object-fit: contain;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.10);
}
.hpAiLogoFallback{
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--hp-accent), var(--hp-accent2));
  box-shadow: 0 10px 25px rgba(30, 90, 168, 0.22);
}
.hpAiBrandText{ min-width: 0; }
.hpAiTitle{
  font-size: 14px;
  font-weight: 900;
  letter-spacing: .02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hpAiSub{
  font-size: 11px;
  color: var(--hp-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hpAiClose{
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid var(--hp-border);
  background: #fff;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  color: var(--hp-muted);
}
.hpAiClose:hover{
  color: var(--hp-text);
  border-color: rgba(30, 90, 168, 0.25);
}

/* ===== Body ===== */
.hpAiBody{
  height: calc(100% - 57px);
  display: flex;
  flex-direction: column;
}
.hpAiLog{
  flex: 1;
  padding: 14px;
  overflow: auto;
  background: linear-gradient(180deg, #ffffff, #f7fbff);
}
.hpAiLog::-webkit-scrollbar{ width: 10px; }
.hpAiLog::-webkit-scrollbar-thumb{
  background: rgba(30, 90, 168, 0.25);
  border-radius: 999px;
}

/* ===== Messages ===== */
.hpAiMsg{
  display: flex;
  margin: 10px 0;
}
.hpAiMsg.user{ justify-content: flex-end; }
.hpAiBubble{
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid var(--hp-border);
  background: #fff;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--hp-text);
}
.hpAiMsg.user .hpAiBubble{
  border-color: rgba(30, 90, 168, 0.25);
  background: linear-gradient(135deg, rgba(30, 90, 168, 0.10), rgba(43, 125, 233, 0.06));
}

/* ===== Footer ===== */
.hpAiFooter{
  display: flex;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid var(--hp-border);
  background: #fff;
}
#hpAiInput{
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--hp-border);
  outline: none;
  background: #fff;
  color: var(--hp-text);
}
#hpAiInput:focus{
  border-color: rgba(43, 125, 233, 0.55);
  box-shadow: 0 0 0 4px rgba(43, 125, 233, 0.14);
}
#hpAiSend{
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(30, 90, 168, 0.18);
  background: linear-gradient(135deg, var(--hp-accent), var(--hp-accent2));
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}
#hpAiSend:hover{
  filter: brightness(1.02);
}

.hpAiFineprint{
  padding: 0 12px 12px 12px;
  font-size: 11px;
  color: var(--hp-muted);
  background: #fff;
}

/* ===== Mobile ===== */
@media (max-width: 520px){
  #hpAiBox{ right: 12px; width: calc(100vw - 24px); }
  #hpAiLauncher{ right: 12px; }
}
  `;
  document.head.appendChild(style);

  // ===== DOM refs =====
  const log = box.querySelector("#hpAiLog");
  const input = box.querySelector("#hpAiInput");
  const send = box.querySelector("#hpAiSend");
  const close = box.querySelector("#hpAiClose");

  function addMsg(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "hpAiMsg " + (role === "user" ? "user" : "ai");
    const bub = document.createElement("div");
    bub.className = "hpAiBubble";
    bub.textContent = text;
    wrap.appendChild(bub);
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return bub;
  }

  function openBox() {
    box.style.display = "block";
    launcher.style.opacity = "0.92";
  }
  function closeBox() {
    box.style.display = "none";
    launcher.style.opacity = "1";
  }

  launcher.addEventListener("click", () => {
    openBox();
    if (!log.dataset.booted) {
      log.dataset.booted = "1";
      addMsg("ai", "相談内容を教えてください。サービス内容、導入の流れ、問い合わせ先など案内する。");
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

      // n8nがHTMLを返したり、空を返す可能性があるので保険
      const ct = res.headers.get("content-type") || "";
      let data = null;

      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const raw = await res.text();
        // JSONっぽければparse試行
        try { data = JSON.parse(raw); } catch { data = { text: raw }; }
      }

      const reply = data?.reply || data?.output || data?.text || data?.message || "";
      pending.textContent = reply ? reply : "返答が空だ。Webhookの返却キーを確認しろ（reply / output / text）。";
    } catch (e) {
      pending.textContent = "通信エラー。CORS(コルス)かWebhookの公開設定だ。";
    }
  }

  send.onclick = doSend;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSend();
  });
})();
