/* ==========================================================================
   Manual Flow — sac.js
   SAC dinâmico por área (Google Sheets via Apps Script) + área de suporte.
   Depende de FLOW_API_URL, definido em assets/js/config.js.
   ========================================================================== */
(function(){
  "use strict";

  const API_READY = typeof FLOW_API_URL !== "undefined"
    && FLOW_API_URL
    && FLOW_API_URL.indexOf("COLE_AQUI") === -1;

  function escapeHtml(s){
    const div = document.createElement("div");
    div.textContent = s || "";
    return div.innerHTML;
  }

  async function apiGet(params){
    const url = new URL(FLOW_API_URL);
    Object.keys(params).forEach(k => { if (params[k] !== undefined) url.searchParams.set(k, params[k]); });
    const res = await fetch(url.toString());
    return res.json();
  }

  async function apiPost(body){
    // text/plain evita pré-voo CORS (OPTIONS), que o Apps Script não trata bem.
    const res = await fetch(FLOW_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  /* ======================================================================
     SAC dinâmico dentro de cada painel de área
     ====================================================================== */
  const loadedAreas = new Set();

  async function loadFaqForArea(role){
    const container = document.querySelector("#faq-" + role);
    if (!container) return;

    if (!API_READY){
      container.innerHTML = `
        <div class="faq-empty">
          <p><strong>SAC ainda não configurado.</strong> Configure a planilha e o Apps Script (veja CONFIGURAR-SAC.md) para que as dúvidas apareçam aqui automaticamente.</p>
        </div>`;
      renderAskForm(container, role, false);
      return;
    }

    container.innerHTML = '<p class="faq-loading">Carregando dúvidas desta área…</p>';
    try {
      const data = await apiGet({ action: "list", area: role });
      renderFaq(container, role, (data && data.items) || []);
      loadedAreas.add(role);
    } catch (err){
      container.innerHTML = '<p class="faq-loading">Não foi possível carregar o SAC agora. Tente novamente mais tarde.</p>';
      renderAskForm(container, role, true);
    }
  }

  function renderFaq(container, role, items){
    container.innerHTML = "";
    if (items.length === 0){
      const empty = document.createElement("div");
      empty.className = "faq-empty";
      empty.innerHTML = "<p>Ainda não há dúvidas registradas para esta área. Seja a primeira pessoa a perguntar — sua pergunta ajuda a construir o SAC para todo mundo.</p>";
      container.appendChild(empty);
    } else {
      items.forEach(item => {
        const d = document.createElement("details");
        d.className = "faq-item";
        d.innerHTML =
          "<summary>" + escapeHtml(item.pergunta) + "</summary>" +
          "<p>" + escapeHtml(item.resposta) + "</p>" +
          '<span class="faq-id">Protocolo ' + escapeHtml(item.id) + "</span>";
        container.appendChild(d);
      });
    }
    renderAskForm(container, role, true);
  }

  function renderAskForm(container, role, enabled){
    const wrap = document.createElement("div");
    wrap.className = "faq-ask";
    wrap.innerHTML =
      '<button class="faq-ask-toggle" type="button">+ Fazer uma nova pergunta</button>' +
      '<form class="faq-ask-form">' +
        '<textarea placeholder="Escreva sua dúvida sobre esta área…" required></textarea>' +
        '<input type="text" placeholder="Seu nome (opcional)">' +
        '<button type="submit" class="btn btn-primary">Enviar pergunta</button>' +
        '<p class="faq-ask-result"></p>' +
      '</form>';
    container.appendChild(wrap);

    const toggle = wrap.querySelector(".faq-ask-toggle");
    const form = wrap.querySelector(".faq-ask-form");
    toggle.addEventListener("click", () => form.classList.toggle("open"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!enabled){
        form.querySelector(".faq-ask-result").textContent = "O envio de perguntas será ativado assim que o SAC estiver configurado.";
        return;
      }
      const textarea = form.querySelector("textarea");
      const nomeInput = form.querySelector('input[type="text"]');
      const resultEl = form.querySelector(".faq-ask-result");
      const btn = form.querySelector('button[type="submit"]');
      if (!textarea.value.trim()) return;
      btn.disabled = true;
      btn.textContent = "Enviando…";
      try {
        const res = await apiPost({ action: "ask", area: role, pergunta: textarea.value.trim(), autor: nomeInput.value.trim() });
        if (res && res.ok){
          resultEl.textContent = "Pergunta registrada! Protocolo " + res.id + ". Assim que for respondida pelo suporte, ela aparece aqui automaticamente.";
          resultEl.classList.add("ok");
          textarea.value = "";
          nomeInput.value = "";
        } else {
          resultEl.textContent = (res && res.error) || "Não foi possível enviar sua pergunta agora. Tente novamente.";
        }
      } catch(err){
        resultEl.textContent = "Erro de conexão. Tente novamente em instantes.";
      } finally {
        btn.disabled = false;
        btn.textContent = "Enviar pergunta";
      }
    });
  }

  // Carrega o SAC sempre que um cartão de área é escolhido no carrossel
  document.querySelectorAll(".role-card").forEach(card => {
    card.addEventListener("click", () => loadFaqForArea(card.dataset.role));
  });

  // Também carrega se a pessoa já tinha uma área salva ao recarregar a página
  document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("flowManualRole");
    if (saved && saved !== "all") loadFaqForArea(saved);
  });
  // fallback: se o DOM já carregou antes deste script rodar
  const savedNow = localStorage.getItem("flowManualRole");
  if (savedNow && savedNow !== "all" && !loadedAreas.has(savedNow)) loadFaqForArea(savedNow);

  /* ======================================================================
     ÁREA DE SUPORTE — login e resposta às pendências
     ====================================================================== */
  const openSupportBtn = document.querySelector("#openSupport");
  const supportGate = document.querySelector("#supportGate");
  const loginForm = document.querySelector("#supportLoginForm");
  const dash = document.querySelector("#supportDash");
  const pendingList = document.querySelector("#pendingList");
  const areaFilter = document.querySelector("#pendingAreaFilter");
  const refreshBtn = document.querySelector("#refreshPending");
  const logoutBtn = document.querySelector("#logoutSupport");

  let session = null; // { usuario, senha, nome }

  openSupportBtn && openSupportBtn.addEventListener("click", () => {
    supportGate.classList.add("show");
    if (!API_READY){
      loginForm.querySelector(".support-error").textContent = "Configure o Apps Script (CONFIGURAR-SAC.md) antes de usar a área de suporte.";
    }
  });

  document.querySelectorAll("[data-close-support]").forEach(btn => {
    btn.addEventListener("click", () => supportGate.classList.remove("show"));
  });
  supportGate && supportGate.addEventListener("click", (e) => {
    if (e.target === supportGate) supportGate.classList.remove("show");
  });

  loginForm && loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!API_READY) return;
    const usuario = loginForm.usuario.value.trim();
    const senha = loginForm.senha.value;
    const errEl = loginForm.querySelector(".support-error");
    errEl.textContent = "Entrando…";
    errEl.classList.remove("ok");
    try {
      const res = await apiPost({ action: "login", usuario, senha });
      if (res && res.ok){
        session = { usuario, senha, nome: res.nome || usuario };
        errEl.textContent = "";
        loginForm.style.display = "none";
        dash.style.display = "block";
        loadPending();
      } else {
        errEl.textContent = (res && res.error) || "Usuário ou senha inválidos.";
      }
    } catch(err){
      errEl.textContent = "Erro de conexão com o Apps Script.";
    }
  });

  logoutBtn && logoutBtn.addEventListener("click", () => {
    session = null;
    dash.style.display = "none";
    loginForm.style.display = "flex";
    loginForm.reset();
    supportGate.classList.remove("show");
  });

  refreshBtn && refreshBtn.addEventListener("click", loadPending);
  areaFilter && areaFilter.addEventListener("change", loadPending);

  async function loadPending(){
    if (!session) return;
    pendingList.innerHTML = "<p>Carregando…</p>";
    try {
      const res = await apiGet({
        action: "pending",
        usuario: session.usuario,
        senha: session.senha,
        area: areaFilter ? areaFilter.value : ""
      });
      if (!res || !res.ok){
        pendingList.innerHTML = "<p>Sessão expirada. Saia e entre novamente.</p>";
        return;
      }
      if (!res.items || res.items.length === 0){
        pendingList.innerHTML = "<p>Nenhuma dúvida pendente por aqui. 🎉</p>";
        return;
      }
      pendingList.innerHTML = "";
      res.items.forEach(item => {
        const card = document.createElement("div");
        card.className = "pending-card";
        card.innerHTML =
          '<div class="pending-meta"><span class="pill">' + escapeHtml(item.area) + '</span><span class="pending-id">' + escapeHtml(item.id) + "</span></div>" +
          '<p class="pending-question">' + escapeHtml(item.pergunta) + "</p>" +
          (item.autor ? '<p class="pending-autor">De: ' + escapeHtml(item.autor) + "</p>" : "") +
          '<textarea placeholder="Escreva a resposta…"></textarea>' +
          '<button class="btn btn-primary" type="button">Responder</button>' +
          '<p class="pending-result"></p>';
        card.querySelector("button").addEventListener("click", async () => {
          const resposta = card.querySelector("textarea").value.trim();
          const resultEl = card.querySelector(".pending-result");
          if (!resposta) { resultEl.textContent = "Escreva uma resposta antes de enviar."; return; }
          resultEl.textContent = "Enviando…";
          try {
            const r = await apiPost({ action: "answer", usuario: session.usuario, senha: session.senha, id: item.id, resposta });
            if (r && r.ok){
              card.style.opacity = "0.5";
              resultEl.textContent = "Respondida! Já aparece no SAC da área.";
              setTimeout(() => card.remove(), 900);
            } else {
              resultEl.textContent = (r && r.error) || "Erro ao responder.";
            }
          } catch(err){
            resultEl.textContent = "Erro de conexão.";
          }
        });
        pendingList.appendChild(card);
      });
    } catch(err){
      pendingList.innerHTML = "<p>Erro ao carregar as pendências.</p>";
    }
  }

})();
