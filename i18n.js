/* Pièce Fenua — bascule Français / Reo Tahiti
   Traduit automatiquement tous les textes affichés qui figurent dans lang/ty.js
   (y compris ceux ajoutés plus tard par l'app). Le reste reste en français. */
(() => {
  let lang = "fr";
  try { lang = localStorage.getItem("pf_lang") || "fr"; } catch {}
  window.PF_LANG = lang;
  window.PF_setLang = l => {
    try { localStorage.setItem("pf_lang", l); } catch {}
    location.reload();
  };

  // bouton FR / TY dans l'en-tête
  document.addEventListener("DOMContentLoaded", () => {
    const top = document.querySelector(".top");
    if (!top) return;
    const b = document.createElement("button");
    b.className = "pill lang";
    b.type = "button";
    b.textContent = lang === "ty" ? "FR" : "Reo Tahiti";
    b.title = lang === "ty" ? "Afficher en français" : "Faʻaʻite i te reo Tahiti";
    b.onclick = () => window.PF_setLang(lang === "ty" ? "fr" : "ty");
    top.appendChild(b);
  });

  if (lang !== "ty") return;
  document.documentElement.lang = "ty";

  const dict = (window.PF_TY && window.PF_TY.exact) || {};
  const pats = (window.PF_TY && window.PF_TY.patterns) || [];
  const RE = /^(\s*[^\p{L}\p{N}]*?\s*)([\p{L}\p{N}].*?)(\s*)$/su;   // préfixe (emoji, espaces) + texte + espaces

  function tr(text) {
    const m = text.match(RE);
    if (!m) return null;
    const key = m[2];
    let out = dict[key];
    if (!out) {
      for (const [re, rep] of pats) if (re.test(key)) { out = key.replace(re, rep); break; }
    }
    return out ? m[1] + out + m[3] : null;
  }
  function node(n) {
    if (n.nodeType === 3) {
      const t = tr(n.data);
      if (t !== null && t !== n.data) n.data = t;
    } else if (n.nodeType === 1) {
      if (n.tagName === "SCRIPT" || n.tagName === "STYLE") return;
      for (const a of ["placeholder", "title", "aria-label"]) {
        const v = n.getAttribute(a);
        if (v) { const t = tr(v); if (t) n.setAttribute(a, t); }
      }
      n.childNodes.forEach(node);
    }
  }
  const start = () => {
    node(document.body);
    new MutationObserver(ms => ms.forEach(m => {
      if (m.type === "characterData") node(m.target);
      else m.addedNodes.forEach(node);
    })).observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
