/* ==========================================================================
   Manual Flow — app.js
   Busca client-side, scrollspy, menu mobile, barra de progresso,
   animações de entrada e impressão.
   ========================================================================== */
(function(){
  "use strict";

  const sidebar   = document.querySelector(".sidebar");
  const overlay   = document.querySelector(".overlay");
  const menuBtn   = document.querySelector(".menu-toggle");
  const searchIn  = document.querySelector("#searchInput");
  const searchRes = document.querySelector("#searchResults");
  const progress  = document.querySelector("#progressFill");
  const backTop   = document.querySelector("#backTop");
  const printBtn  = document.querySelector("#printBtn");
  const breadcrumbEl = document.querySelector("#breadcrumbCurrent");

  /* ---------------- Mobile sidebar ---------------- */
  function openSidebar(){
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }
  function closeSidebar(){
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
  menuBtn && menuBtn.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  overlay && overlay.addEventListener("click", closeSidebar);

  /* ---------------- Accordion (áreas) ---------------- */
  document.querySelectorAll(".nav-area-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const area = btn.closest(".nav-area");
      const wasOpen = area.classList.contains("open");
      // fecha as outras (acordeão único) — comportamento opcional
      area.classList.toggle("open", !wasOpen);
    });
  });

  /* ---------------- Build search index from DOM ---------------- */
  const sections = Array.from(document.querySelectorAll(".section[id]"));
  const index = sections.map(sec => {
    const areaBlock = sec.closest(".area-block");
    const areaName = areaBlock ? areaBlock.dataset.areaName : "";
    const titleEl = sec.querySelector("h3");
    const title = titleEl ? titleEl.textContent.trim() : sec.id;
    const text = sec.textContent.replace(/\s+/g, " ").trim();
    return { id: sec.id, area: areaName, title, text };
  });

  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function highlight(text, q){
    const re = new RegExp("(" + escapeRegExp(q) + ")", "ig");
    return text.replace(re, "<mark>$1</mark>");
  }

  function snippet(text, q){
    const lower = text.toLowerCase();
    const i = lower.indexOf(q.toLowerCase());
    if (i === -1) return text.slice(0, 110) + "…";
    const start = Math.max(0, i - 50);
    const end = Math.min(text.length, i + q.length + 70);
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
  }

  let activeIdx = -1;
  let currentResults = [];

  function renderResults(q){
    if (!q){
      searchRes.classList.remove("open");
      searchRes.innerHTML = "";
      return;
    }
    const ql = q.toLowerCase();
    currentResults = index.filter(item =>
      item.title.toLowerCase().includes(ql) || item.text.toLowerCase().includes(ql)
    ).slice(0, 8);

    activeIdx = -1;

    if (currentResults.length === 0){
      searchRes.innerHTML = '<div class="sr-empty">Nenhum resultado para "' + q + '"</div>';
      searchRes.classList.add("open");
      return;
    }

    searchRes.innerHTML = currentResults.map((item, i) => `
      <a class="sr-item" href="#${item.id}" data-idx="${i}">
        <span class="sr-area">${item.area}</span>
        <span class="sr-title">${highlight(item.title, q)}</span>
        <span class="sr-snippet">${highlight(snippet(item.text, q), q)}</span>
      </a>
    `).join("");
    searchRes.classList.add("open");
  }

  searchIn && searchIn.addEventListener("input", e => renderResults(e.target.value.trim()));

  searchIn && searchIn.addEventListener("keydown", e => {
    const items = Array.from(searchRes.querySelectorAll(".sr-item"));
    if (!items.length) return;
    if (e.key === "ArrowDown"){
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach((it,i)=> it.classList.toggle("active", i===activeIdx));
      items[activeIdx].scrollIntoView({block:"nearest"});
    } else if (e.key === "ArrowUp"){
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      items.forEach((it,i)=> it.classList.toggle("active", i===activeIdx));
      items[activeIdx].scrollIntoView({block:"nearest"});
    } else if (e.key === "Enter"){
      e.preventDefault();
      const target = activeIdx >= 0 ? items[activeIdx] : items[0];
      if (target) goTo(target.getAttribute("href"));
    } else if (e.key === "Escape"){
      searchIn.blur();
      searchRes.classList.remove("open");
    }
  });

  searchRes && searchRes.addEventListener("click", e => {
    const a = e.target.closest(".sr-item");
    if (!a) return;
    e.preventDefault();
    goTo(a.getAttribute("href"));
  });

  function goTo(hash){
    searchRes.classList.remove("open");
    searchIn.value = "";
    searchIn.blur();
    closeSidebar();
    const el = document.querySelector(hash);
    if (el){
      history.pushState(null, "", hash);
      el.scrollIntoView({behavior:"smooth", block:"start"});
      flash(el);
      openParentArea(el);
    }
  }

  function flash(el){
    el.style.transition = "background-color .25s ease";
    el.style.backgroundColor = "rgba(31,174,99,.12)";
    setTimeout(() => { el.style.backgroundColor = ""; }, 1100);
  }

  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) searchRes.classList.remove("open");
  });

  // atalho "/" foca a busca
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== searchIn){
      e.preventDefault();
      openSidebar();
      searchIn.focus();
    }
  });

  /* ---------------- Open parent accordion for a given section ---------------- */
  function openParentArea(el){
    const area = el.closest(".nav-area") || (function(){
      const block = el.closest(".area-block");
      if (!block) return null;
      return document.querySelector('.nav-area[data-area="' + block.dataset.areaId + '"]');
    })();
    if (area) area.classList.add("open");
  }

  /* ---------------- Sidebar link clicks ---------------- */
  document.querySelectorAll(".nav-sub a").forEach(a => {
    a.addEventListener("click", () => { closeSidebar(); });
  });

  /* ---------------- Scrollspy ---------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav-sub a"));
  const linkById = {};
  navLinks.forEach(a => { linkById[a.getAttribute("href").slice(1)] = a; });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
  sections.forEach(s => revealObserver.observe(s));

  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = linkById[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting){
        navLinks.forEach(l => l.classList.remove("active"));
        document.querySelectorAll(".nav-area").forEach(a => a.classList.remove("has-active"));
        link.classList.add("active");
        const area = link.closest(".nav-area");
        if (area){ area.classList.add("has-active"); area.classList.add("open"); }
        if (breadcrumbEl) breadcrumbEl.textContent = link.textContent.trim();
      }
    });
  }, { threshold: 0, rootMargin: "-15% 0px -70% 0px" });
  sections.forEach(s => spyObserver.observe(s));

  /* ---------------- Scroll progress + back to top ---------------- */
  function onScroll(){
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (backTop) backTop.classList.toggle("show", scrollTop > 480);
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  backTop && backTop.addEventListener("click", () => {
    window.scrollTo({ top:0, behavior:"smooth" });
  });

  /* ---------------- Print ---------------- */
  printBtn && printBtn.addEventListener("click", () => {
    document.querySelectorAll(".nav-area").forEach(a => a.classList.add("open"));
    window.print();
  });

  /* ---------------- Open area containing the hash on load ---------------- */
  if (location.hash){
    const el = document.querySelector(location.hash);
    if (el){
      openParentArea(el);
      setTimeout(() => el.scrollIntoView({block:"start"}), 80);
    }
  } else {
    // abre a primeira área por padrão
    const firstArea = document.querySelector(".nav-area");
    if (firstArea) firstArea.classList.add("open");
  }

})();
