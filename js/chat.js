/* ============================================================
   CHAT ASSISTANT — Dual Mode (Live Webhook & Smart Portfolio AI)

   1. Live Webhook Mode:
      If a webhook URL is provided in SITE.chatbot.webhookUrl or via
      the in-chat settings drawer, messages are sent via POST:
        { chatInput, message, sessionId }
      Compatible with n8n Chat Trigger, Webhook node, Make, Botpress, etc.

   2. Smart Portfolio Assistant Mode:
      If no webhook is configured yet, the assistant automatically
      answers questions about projects, skills, stack, and contact details
      directly from SITE data in js/data.js.
   ============================================================ */

var CHAT = {
  root: null,
  panel: null,
  log: null,
  input: null,
  send: null,
  opener: null,
  settingsModal: null,
  chipsContainer: null,
  sessionId: "",
  busy: false,
  soundEnabled: false,
  audioCtx: null
};

/* ---------- Initialization ---------------------------------- */

function startChat() {
  CHAT.root = document.getElementById("chat-root");
  if (!CHAT.root) { return; }

  CHAT.sessionId = makeSessionId();

  var settings = (typeof SITE !== "undefined" && SITE.chatbot) ? SITE.chatbot : {
    title: "Ask about my work",
    greeting: "Hi there! I'm the portfolio assistant. Ask me anything about the projects, skills, or automation workflows on this page.",
    placeholder: "Type a question or pick a topic below..."
  };

  buildOpener(settings);
  buildPanel(settings);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && CHAT.panel && !CHAT.panel.hidden) {
      closeChat();
    }
  });
}

function makeSessionId() {
  return "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function getActiveWebhookUrl() {
  var saved = "";
  try { saved = localStorage.getItem("portfolio_chatbot_webhook"); } catch (e) {}
  if (saved && saved.trim()) { return saved.trim(); }
  if (typeof SITE !== "undefined" && SITE.chatbot && SITE.chatbot.webhookUrl) {
    return SITE.chatbot.webhookUrl.trim();
  }
  return "";
}

function setActiveWebhookUrl(url) {
  try {
    if (url) {
      localStorage.setItem("portfolio_chatbot_webhook", url.trim());
    } else {
      localStorage.removeItem("portfolio_chatbot_webhook");
    }
  } catch (e) {}
  updateHeaderStatus();
}

/* ---------- Audio Feedback ---------------------------------- */

function playChime() {
  if (!CHAT.soundEnabled) { return; }
  try {
    if (!CHAT.audioCtx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) { CHAT.audioCtx = new AudioCtx(); }
    }
    if (CHAT.audioCtx && CHAT.audioCtx.state === "suspended") {
      CHAT.audioCtx.resume();
    }
    if (!CHAT.audioCtx) { return; }

    var osc = CHAT.audioCtx.createOscillator();
    var gain = CHAT.audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, CHAT.audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, CHAT.audioCtx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.06, CHAT.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, CHAT.audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(CHAT.audioCtx.destination);
    osc.start();
    osc.stop(CHAT.audioCtx.currentTime + 0.25);
  } catch (e) {}
}

/* ---------- UI Construction --------------------------------- */

function buildOpener(settings) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "chat-open";
  button.id = "chat-open-btn";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-label", settings.title || "Open chat assistant");

  // Modern robot/sparkle chat icon
  var iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute("class", "chat-open__icon");
  iconSvg.setAttribute("viewBox", "0 0 24 24");
  iconSvg.setAttribute("fill", "none");
  iconSvg.setAttribute("stroke", "currentColor");
  iconSvg.setAttribute("stroke-width", "2");
  iconSvg.setAttribute("stroke-linecap", "round");
  iconSvg.setAttribute("stroke-linejoin", "round");
  iconSvg.innerHTML = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 10h.01"></path><path d="M12 10h.01"></path><path d="M16 10h.01"></path>';

  var label = document.createElement("span");
  label.className = "chat-open__label";
  label.textContent = settings.title || "Ask about my work";

  var pulse = document.createElement("span");
  pulse.className = "chat-open__pulse";
  pulse.setAttribute("aria-hidden", "true");

  button.appendChild(pulse);
  button.appendChild(iconSvg);
  button.appendChild(label);

  button.addEventListener("click", openChat);
  CHAT.root.appendChild(button);
  CHAT.opener = button;
}

function buildPanel(settings) {
  var panel = document.createElement("div");
  panel.className = "chat";
  panel.id = "chat-dialog";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-label", settings.title || "Chat with AI Assistant");

  /* ---------- Header Bar ---------- */
  var bar = document.createElement("div");
  bar.className = "chat__bar";

  var barInfo = document.createElement("div");
  barInfo.className = "chat__bar-info";

  var avatar = document.createElement("div");
  avatar.className = "chat__avatar";
  avatar.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><rect x="4" y="6" width="16" height="12" rx="2"></rect><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M10 16h4"></path></svg>';

  var titleWrap = document.createElement("div");
  titleWrap.className = "chat__title-wrap";

  var title = document.createElement("span");
  title.className = "chat__title";
  title.textContent = settings.title || "Portfolio Assistant";

  var statusBadge = document.createElement("span");
  statusBadge.className = "chat__status";
  statusBadge.id = "chat-status-badge";
  statusBadge.textContent = "Checking...";

  titleWrap.appendChild(title);
  titleWrap.appendChild(statusBadge);
  barInfo.appendChild(avatar);
  barInfo.appendChild(titleWrap);

  var controls = document.createElement("div");
  controls.className = "chat__controls";

  // Clear chat button
  var clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "chat__tool-btn";
  clearBtn.setAttribute("title", "Reset conversation");
  clearBtn.setAttribute("aria-label", "Reset conversation");
  clearBtn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>';
  clearBtn.addEventListener("click", function () {
    CHAT.log.innerHTML = "";
    addMessage(settings.greeting || "Conversation restarted. What would you like to know?", "bot");
  });

  // Close button
  var close = document.createElement("button");
  close.type = "button";
  close.className = "chat__close";
  close.setAttribute("aria-label", "Close the chat");
  close.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  close.addEventListener("click", closeChat);

  controls.appendChild(clearBtn);
  controls.appendChild(close);

  bar.appendChild(barInfo);
  bar.appendChild(controls);
  panel.appendChild(bar);

  /* ---------- Message Log ---------- */
  var log = document.createElement("div");
  log.className = "chat__log";
  log.id = "chat-messages-log";
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");
  panel.appendChild(log);

  /* ---------- Suggested Chips ---------- */
  var chips = buildSuggestedChips();
  panel.appendChild(chips);
  CHAT.chipsContainer = chips;

  /* ---------- Input Row ---------- */
  var form = document.createElement("form");
  form.className = "chat__form";
  form.id = "chat-input-form";

  var input = document.createElement("input");
  input.className = "chat__input";
  input.id = "chat-text-input";
  input.type = "text";
  input.autocomplete = "off";
  input.placeholder = settings.placeholder || "Type a question...";
  input.setAttribute("aria-label", "Your question");

  var send = document.createElement("button");
  send.type = "submit";
  send.className = "chat__send";
  send.id = "chat-send-btn";
  send.setAttribute("aria-label", "Send message");
  send.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';

  form.appendChild(input);
  form.appendChild(send);
  form.addEventListener("submit", handleSend);
  panel.appendChild(form);

  CHAT.root.appendChild(panel);

  CHAT.panel = panel;
  CHAT.log = log;
  CHAT.input = input;
  CHAT.send = send;

  updateHeaderStatus();
  addMessage(settings.greeting || "Ask me anything about the projects on this page.", "bot");
}

function updateHeaderStatus() {
  var badge = document.getElementById("chat-status-badge");
  if (!badge) { return; }

  var webhook = getActiveWebhookUrl();
  if (webhook) {
    badge.className = "chat__status chat__status--live";
    badge.innerHTML = '<span class="chat__status-dot"></span> Live Webhook';
    badge.setAttribute("title", "Connected to: " + webhook);
  } else {
    badge.className = "chat__status chat__status--smart";
    badge.innerHTML = '<span class="chat__status-dot"></span> Smart Assistant';
    badge.setAttribute("title", "Answering from portfolio data.");
  }
}

/* ---------- Suggested Chips --------------------------------- */

function buildSuggestedChips() {
  var container = document.createElement("div");
  container.className = "chat__chips";

  var questions = [
    "Tell me about Maintain IQ",
    "What AI automations have you built?",
    "What is your tech stack?",
    "How can I contact you?"
  ];

  questions.forEach(function (q) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chat__chip";
    chip.textContent = q;
    chip.addEventListener("click", function () {
      if (CHAT.busy) { return; }
      CHAT.input.value = q;
      handleSend(new Event("submit"));
    });
    container.appendChild(chip);
  });

  return container;
}

/* ---------- Open and Close ---------------------------------- */

function openChat() {
  CHAT.panel.hidden = false;
  CHAT.opener.hidden = true;
  updateHeaderStatus();
  setTimeout(function () {
    CHAT.input.focus();
  }, 100);
}

function closeChat() {
  CHAT.panel.hidden = true;
  CHAT.opener.hidden = false;
  CHAT.opener.focus();
}

/* ---------- Markdown & Safe Formatter ----------------------- */

function formatMessageContent(rawText) {
  if (!rawText) { return ""; }

  // 1. HTML Entities escape
  var safe = rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  // 2. Bold **text**
  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 3. Inline code `code`
  safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 4. Markdown links [label](url)
  safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // 5. Raw URLs not already inside tags
  safe = safe.replace(/(^|[^">])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

  // 6. Bullet points: lines beginning with "- " or "* "
  var lines = safe.split("\n");
  var out = [];
  var inList = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);

    if (bulletMatch) {
      if (!inList) {
        out.push("<ul class='msg__list'>");
        inList = true;
      }
      out.push("<li>" + bulletMatch[2] + "</li>");
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(line);
    }
  }
  if (inList) { out.push("</ul>"); }

  return out.join("<br>").replace(/(<br>\s*){3,}/g, "<br><br>");
}

/* ---------- Message Handling -------------------------------- */

function addMessage(content, who) {
  var line = document.createElement("div");
  line.className = "msg msg--" + who;

  if (who === "bot") {
    line.innerHTML = formatMessageContent(content);
    playChime();
  } else if (who === "status") {
    line.innerHTML = formatMessageContent(content);
  } else {
    line.textContent = content;
  }

  CHAT.log.appendChild(line);
  CHAT.log.scrollTop = CHAT.log.scrollHeight;
  return line;
}

function showTyping() {
  var bubble = document.createElement("div");
  bubble.className = "msg msg--bot msg--typing";
  bubble.id = "chat-typing-indicator";
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  CHAT.log.appendChild(bubble);
  CHAT.log.scrollTop = CHAT.log.scrollHeight;
  return bubble;
}

function removeTyping() {
  var el = document.getElementById("chat-typing-indicator");
  if (el) { el.remove(); }
}

function handleSend(event) {
  if (event && event.preventDefault) { event.preventDefault(); }
  if (CHAT.busy) { return; }

  var question = CHAT.input.value.trim();
  if (!question) { return; }

  addMessage(question, "you");
  CHAT.input.value = "";
  setBusy(true);

  var typing = showTyping();
  var webhookUrl = getActiveWebhookUrl();

  if (webhookUrl) {
    // Live Webhook Mode
    askWebhook(question, webhookUrl)
      .then(function (answer) {
        removeTyping();
        addMessage(answer, "bot");
      })
      .catch(function (err) {
        removeTyping();
        var errorMsg = addMessage("⚠️ Webhook could not be reached: " + (err.message || "Network Error") + ".\n\n*Check that your n8n workflow is Active and CORS is allowed on the Respond to Webhook node.*", "error");

        // Offer smart assistant fallback button
        var fallbackBtn = document.createElement("button");
        fallbackBtn.className = "chat__retry-btn";
        fallbackBtn.textContent = "Answer with Smart Assistant instead";
        fallbackBtn.addEventListener("click", function () {
          fallbackBtn.remove();
          var localAnswer = smartAssistantReply(question);
          addMessage(localAnswer, "bot");
        });
        errorMsg.appendChild(fallbackBtn);
      })
      .then(function () {
        setBusy(false);
        CHAT.log.scrollTop = CHAT.log.scrollHeight;
        CHAT.input.focus();
      });
  } else {
    // Smart Portfolio Assistant Mode (Instant local intelligence)
    setTimeout(function () {
      removeTyping();
      var answer = smartAssistantReply(question);
      addMessage(answer, "bot");
      setBusy(false);
      CHAT.log.scrollTop = CHAT.log.scrollHeight;
      CHAT.input.focus();
    }, 450); // slight natural pause
  }
}

function setBusy(state) {
  CHAT.busy = state;
  CHAT.send.disabled = state;
  if (state) {
    CHAT.send.classList.add("is-busy");
  } else {
    CHAT.send.classList.remove("is-busy");
  }
}

/* ---------- Talking to Live Webhook ------------------------- */

function askWebhook(question, url) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*"
    },
    body: JSON.stringify({
      chatInput: question,
      message: question,
      sessionId: CHAT.sessionId
    })
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status + " " + response.statusText);
      }
      return response.text();
    })
    .then(readAnswer);
}

function readAnswer(raw) {
  var data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    return raw.trim() || "No answer came back from the webhook.";
  }

  if (Array.isArray(data)) { data = data[0] || {}; }
  if (typeof data === "string") { return data; }

  var keys = ["output", "text", "reply", "answer", "response", "message", "result"];
  for (var i = 0; i < keys.length; i++) {
    var value = data[keys[i]];
    if (typeof value === "string" && value.trim()) { return value.trim(); }
  }

  if (data.json) { return readAnswer(JSON.stringify(data.json)); }
  if (data.data && typeof data.data === "string") { return data.data; }

  return JSON.stringify(data, null, 2);
}

/* ---------- Smart Portfolio Assistant (Offline Fallback) ----- */

function smartAssistantReply(query) {
  var q = query.toLowerCase();
  var site = (typeof SITE !== "undefined") ? SITE : null;

  // 1. Greetings
  if (q.match(/\b(hi|hello|hey|salam|assalam|aoa|kya haal|greetings|hola)\b/)) {
    return "Hello! I am the portfolio assistant for **Bilal**. You can ask me about:\n- **Featured Projects** (e.g., Maintain IQ, Al-Mustafa Academy)\n- **Skills & Tech Stack** (HTML, CSS, Bootstrap, JavaScript, n8n, AI prompts)\n- **Automation workflows**\n- **Contact & hiring details**";
  }

  // 2. Webhook Setup Questions
  if (q.match(/\b(webhook|n8n|connect|link|integrate|url|api)\b/) && q.match(/\b(how|where|add|setup|put|paste|configure|lagana|kahan)\b/)) {
    return "To link your live n8n webhook:\n1. Open `js/data.js` and paste your Production webhook URL into `SITE.chatbot.webhookUrl`.\n\nYour n8n webhook will receive POST requests with `{ chatInput, message, sessionId }` and can return `{ text: \"reply\" }` or `{ output: \"reply\" }`.";
  }

  // 3. Maintain IQ
  if (q.indexOf("maintain iq") > -1 || q.indexOf("maintain") > -1) {
    var p = findProject("Maintain IQ");
    var res = "**Maintain IQ** is an IT and facility maintenance dashboard.\n";
    if (p) {
      res += "- **Summary**: " + p.summary + "\n";
      res += "- **Stages**: Defect reported → Ticket raised → Technician dispatched → Closed & logged.\n";
      res += "- **Stack**: Hand-crafted HTML, CSS and JavaScript (no frameworks, deploys as static files).\n";
      if (p.url) { res += "- **Live Link**: [Open Maintain IQ](" + p.url + ")"; }
    }
    return res;
  }

  // 4. Embedded AI Assistant / Portfolio
  if (q.indexOf("portfolio site with an embedded") > -1 || q.indexOf("embedded ai") > -1 || (q.indexOf("assistant") > -1 && q.indexOf("project") > -1)) {
    var p2 = findProject("Portfolio site with an embedded AI assistant");
    return "**Portfolio with Embedded AI Assistant**:\n" +
      (p2 ? p2.summary : "A portfolio with an n8n-powered chat assistant built with prompt engineering.") +
      "\n- **Tested rigorously**: 6 iterations of system prompts tested against hallucination, jailbreaks and data-leaks.\n" +
      "- **Stack**: HTML, CSS, JavaScript, n8n, and Claude Code.";
  }

  // 5. Al-Mustafa Academy
  if (q.indexOf("mustafa") > -1 || q.indexOf("academy") > -1) {
    var p3 = findProject("Al-Mustafa Academy");
    return "**Al-Mustafa Academy**:\n" +
      (p3 ? p3.summary : "A multi-section education academy site built with pure HTML & CSS.") +
      (p3 && p3.url ? "\n- **Live Link**: [Open Al-Mustafa Academy](" + p3.url + ")" : "");
  }

  // 6. To-do list or Calculator or Quiz
  if (q.indexOf("todo") > -1 || q.indexOf("to-do") > -1 || q.indexOf("task") > -1) {
    var p4 = findProject("To-do list app");
    return "**To-do List App**:\n" + (p4 ? p4.summary : "Dynamic task management app.") +
      "\n- **Architecture**: State-driven rendering from a clean array rather than patching raw DOM nodes." +
      (p4 && p4.url ? "\n- [Open To-do App](" + p4.url + ")" : "");
  }

  if (q.indexOf("calculator") > -1) {
    var p5 = findProject("Calculator");
    return "**Calculator App**:\n" + (p5 ? p5.summary : "Precision calculator handling operator chaining and decimal edge cases.") +
      (p5 && p5.url ? "\n- [Open Calculator](" + p5.url + ")" : "");
  }

  if (q.indexOf("quiz") > -1) {
    var p6 = findProject("Quiz app");
    return "**Quiz App**:\n" + (p6 ? p6.summary : "Multiple choice quiz with separated data array and scoring engine.");
  }

  if (q.indexOf("salt") > -1 || q.indexOf("pepper") > -1) {
    var p7 = findProject("SaltnPepper");
    return "**SaltnPepper Clone**:\n" + (p7 ? p7.summary : "Restaurant landing page rebuilt as an exercise in rigorous CSS layout reproduction.") +
      (p7 && p7.url ? "\n- [Open SaltnPepper Clone](" + p7.url + ")" : "");
  }

  if (q.indexOf("bloom") > -1) {
    var p8 = findProject("Bloom landing page");
    return "**Bloom Landing Page (Twice)**:\n" + (p8 ? p8.summary : "Built once with hand-written CSS and once with Bootstrap to measure development trade-offs.") +
      (p8 && p8.url ? "\n- [Open Bloom Build](" + p8.url + ")" : "");
  }

  // 7. General Projects inquiry
  if (q.indexOf("project") > -1 || q.indexOf("work") > -1 || q.indexOf("portfolio") > -1 || q.indexOf("build") > -1) {
    if (site && site.projects) {
      var list = site.projects.map(function (p) {
        return "- **" + p.name + "** (" + p.kind + ")" + (p.url ? " — [Live](" + p.url + ")" : "");
      }).join("\n");
      return "Here are the builds showcased in this portfolio:\n" + list + "\n\nFeel free to ask about any specific project for details!";
    }
  }

  // 8. Skills & Stack
  if (q.indexOf("skill") > -1 || q.indexOf("stack") > -1 || q.indexOf("technology") > -1 || q.indexOf("tech") > -1 || q.indexOf("language") > -1 || q.indexOf("framework") > -1) {
    return "**Core Technical Skills**:\n" +
      "- **Front-end**: Semantic HTML, Flexbox/Grid CSS, Bootstrap, DOM-level JavaScript.\n" +
      "- **AI & Automation**: n8n workflow architecture, Webhook triggers, System Prompt engineering, Agentic CLI tools (Claude Code, Gemini CLI).\n" +
      "- **Learning currently**: Python and Async/API JavaScript beyond the DOM.";
  }

  // 9. Automation & n8n
  if (q.indexOf("automation") > -1 || q.indexOf("n8n") > -1 || q.indexOf("agent") > -1 || q.indexOf("prompt") > -1) {
    return "**AI & Automation Expertise**:\n" +
      "- Spec-driven n8n workflows connecting webhooks with LLMs.\n" +
      "- Rigorous prompt testing with defensive boundaries against hallucination and jailbreaking.\n" +
      "- Practical agentic workflows integrated into front-end user experiences.";
  }

  // 10. Contact & Hire
  if (q.indexOf("contact") > -1 || q.indexOf("email") > -1 || q.indexOf("hire") > -1 || q.indexOf("reach") > -1 || q.indexOf("location") > -1 || q.indexOf("available") > -1) {
    var email = (site && site.contact && site.contact.email) ? site.contact.email : "you@example.com";
    var avail = (site && site.contact && site.contact.availability) ? site.contact.availability : "Open to front-end and automation roles.";
    return "**Get in Touch**:\n" +
      "- **Availability**: " + avail + "\n" +
      "- **Email**: [" + email + "](mailto:" + email + ")\n" +
      "- **Location**: " + ((site && site.identity && site.identity.location) ? site.identity.location : "Remote");
  }

  // 11. Who are you / Identity
  if (q.indexOf("who are you") > -1 || q.indexOf("your name") > -1 || q.indexOf("about you") > -1 || q.indexOf("who made") > -1 || q.indexOf("bilal") > -1) {
    var name = (site && site.identity && site.identity.name) ? site.identity.name : "Bilal";
    var role = (site && site.identity && site.identity.roleLine) ? site.identity.roleLine : "Automation Builder";
    return "This portfolio belongs to **" + name + "** — *" + role + "*.\nSpecializing in clean hand-coded interfaces and robust n8n automations.";
  }

  // Default helpful response
  return "I can answer any questions about the builds, skills, and automations on this portfolio!\n\nTry asking:\n- *\"Tell me about Maintain IQ\"*\n- *\"What n8n automations have you built?\"*\n- *\"What is your tech stack?\"*\n- *\"How can I contact you?\"*\n\n*(When you connect your n8n webhook in data.js, your live model will take over!)*";
}

function findProject(search) {
  if (typeof SITE === "undefined" || !SITE.projects) { return null; }
  var s = search.toLowerCase();
  for (var i = 0; i < SITE.projects.length; i++) {
    if (SITE.projects[i].name.toLowerCase().indexOf(s) > -1) {
      return SITE.projects[i];
    }
  }
  return null;
}

/* ---------- Start on DOM Ready ------------------------------ */

document.addEventListener("DOMContentLoaded", startChat);
