/* Pièce Fenua — logique de l'application (démo 100 % navigateur) */
(() => {
  "use strict";

  // ---------- stockage local (avec repli en mémoire) ----------
  const mem = {};
  const store = {
    get(k, def) {
      try { const v = localStorage.getItem("pf_" + k); return v ? JSON.parse(v) : def; }
      catch { return k in mem ? mem[k] : def; }
    },
    set(k, v) {
      mem[k] = v;
      try { localStorage.setItem("pf_" + k, JSON.stringify(v)); return true; }
      catch { return false; }
    }
  };

  let annonces = store.get("annonces", null) || DEMO_ANNONCES.slice();
  let vols = store.get("vols", null) || DEMO_VOLS.slice();
  let demandes = store.get("demandes", []);
  const save = () => { store.set("annonces", annonces); store.set("vols", vols); store.set("demandes", demandes); };

  // ---------- utilitaires ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const prix = n => Number(n).toLocaleString("fr-FR").replace(/ | /g, " ") + " F";
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const normSerie = s => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const catNom = id => (CATEGORIES.find(c => c.id === id) || {}).nom || id;
  const catIco = id => (CATEGORIES.find(c => c.id === id) || {}).ico || "🔧";
  const telDigits = t => String(t || "").replace(/\D/g, "");
  const waLink = t => { const d = telDigits(t); return "https://wa.me/" + (d.length === 8 ? "689" + d : d); };
  const depuis = ts => {
    const h = Math.round((Date.now() - ts) / 3600000);
    if (h < 1) return "à l'instant";
    if (h < 24) return "il y a " + h + " h";
    return "il y a " + Math.round(h / 24) + " j";
  };
  const SEUIL = 50000; // F CFP : au-delà, n° de série + justificatif obligatoires
  const JUSTIF = { carte_grise: "Carte grise", ticket: "Ticket / facture d'achat", pv_casse: "Certificat de destruction / achat d'épave" };
  const estVole = serie => { const n = normSerie(serie); return n && vols.some(v => normSerie(v.serie) === n); };

  // ---------- navigation ----------
  $$(".tabs button").forEach(b => b.addEventListener("click", () => {
    $$(".tabs button").forEach(x => x.classList.toggle("on", x === b));
    $$(".view").forEach(v => v.classList.toggle("on", v.id === "v-" + b.dataset.view));
    render();
    window.scrollTo({ top: 0 });
  }));

  // ---------- listes déroulantes ----------
  const optsCat = CATEGORIES.map(c => `<option value="${c.id}">${c.ico} ${esc(c.nom)}</option>`).join("");
  const optsIle = ILES.map(i => `<option>${esc(i)}</option>`).join("");
  $$(".sel-cat").forEach(s => s.innerHTML = optsCat);
  $$(".sel-ile").forEach(s => s.innerHTML = optsIle);
  $("#f-ile").innerHTML = `<option value="">Toutes les îles</option>` + optsIle;

  // ---------- catégories (recherche) ----------
  let catSel = "";
  $("#cats").innerHTML = CATEGORIES.map(c =>
    `<button class="cat" data-cat="${c.id}"><span class="ico">${c.ico}</span>${esc(c.nom)}</button>`).join("");
  $$("#cats .cat").forEach(b => b.addEventListener("click", () => {
    catSel = catSel === b.dataset.cat ? "" : b.dataset.cat;
    $$("#cats .cat").forEach(x => x.classList.toggle("on", x.dataset.cat === catSel));
    renderResults();
  }));
  ["#q", "#f-etat", "#f-ile", "#f-stock", "#f-tri"].forEach(s => $(s).addEventListener("input", renderResults));

  // ---------- badges ----------
  function badges(a) {
    let b = "";
    if (a.etat === "neuf") b += `<span class="badge b-neuf">Neuf</span>`;
    else if (a.justif_type) b += `<span class="badge b-verif">✔ Occasion — provenance vérifiée</span>`;
    else b += `<span class="badge b-attente">Occasion — vendeur identifié</span>`;
    if (a.type === "casse") b += `<span class="badge b-neuf">Casse</span>`;
    if (a.type === "particulier") b += `<span class="badge b-neuf">Particulier</span>`;
    return b;
  }
  function stockTxt(a) {
    if (a.qte > 3) return `<span class="ok">● ${a.qte} en stock</span>`;
    if (a.qte > 0) return `<span class="low">● ${a.qte} en stock</span>`;
    return `<span class="no">● ${a.commande ? "Sur commande " + esc(a.commande) : "Rupture"}</span>`;
  }

  // ---------- recherche ----------
  function renderResults() {
    const q = norm($("#q").value).split(/\s+/).filter(Boolean);
    const etat = $("#f-etat").value, ile = $("#f-ile").value, stock = $("#f-stock").checked, tri = $("#f-tri").value;
    let list = annonces.filter(a =>
      a.statut === "publie" && !estVole(a.serie) &&
      (!catSel || a.cat === catSel) &&
      (!etat || a.etat === etat) &&
      (!ile || a.ile === ile) &&
      (!stock || a.qte > 0) &&
      q.every(w => norm([a.nom, a.compat, a.ref, a.vendeur, a.commune, catNom(a.cat)].join(" ")).includes(w)));
    list.sort(tri === "prix" ? (x, y) => x.prix - y.prix : (x, y) => y.maj - x.maj);

    $("#count").textContent = list.length + (list.length > 1 ? " pièces trouvées" : " pièce trouvée");
    $("#results").innerHTML = list.length ? list.map(a => `
      <article class="card">
        <div class="h"><div class="t">${catIco(a.cat)} ${esc(a.nom)}</div><div class="p">${prix(a.prix)}</div></div>
        <div class="m">${esc(a.compat)}${a.ref ? " · Réf. " + esc(a.ref) : ""}</div>
        <div class="m"><b>${esc(a.vendeur)}</b> · ${esc(a.commune)}, ${esc(a.ile)} · ${stockTxt(a)} · mis à jour ${depuis(a.maj)}</div>
        ${badges(a)}
        <div class="actions">
          <a class="btn g" href="${waLink(a.tel)}" target="_blank" rel="noopener">💬 WhatsApp</a>
          <a class="btn b" href="tel:${telDigits(a.tel)}">📞 Appeler</a>
          ${a.qte > 0 ? `<button class="btn" data-resa="${esc(a.id)}">Réserver 24 h</button>` : ""}
        </div>
      </article>`).join("")
      : `<div class="empty">Aucune pièce trouvée.<br><button class="btn" id="go-demande">📣 Lancer une demande à tous les fournisseurs</button></div>`;

    $$("[data-resa]").forEach(b => b.addEventListener("click", () => {
      const a = annonces.find(x => x.id === b.dataset.resa);
      b.outerHTML = `<span class="badge b-verif">Réservé jusqu'à demain — présente-toi chez ${esc(a.vendeur)}</span>`;
    }));
    const go = $("#go-demande");
    if (go) go.addEventListener("click", () => {
      $('[data-view="demande"]').click();
      $('#form-demande [name="piece"]').value = $("#q").value;
      if (catSel) $('#form-demande [name="cat"]').value = catSel;
    });
  }

  // ---------- demande groupée ----------
  $("#form-demande").addEventListener("submit", e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const nbFourn = new Set(annonces.filter(a => a.cat === f.cat && a.statut === "publie").map(a => a.vendeur)).size;
    demandes.unshift({ ...f, date: Date.now(), nbFourn });
    save(); e.target.reset(); renderDemandes();
  });
  function renderDemandes() {
    $("#demandes").innerHTML = demandes.length ? demandes.map(d => `
      <div class="card"><div class="t">${catIco(d.cat)} ${esc(d.piece)}</div>
      <div class="m">${esc(d.vehicule || catNom(d.cat))} · ${esc(d.ile)} · ${depuis(d.date)}</div>
      <span class="badge b-attente">Envoyée à ${d.nbFourn} fournisseur(s) — en attente de réponses</span></div>`).join("")
      : `<p class="muted">Aucune demande pour l'instant.</p>`;
  }

  // ---------- vendre ----------
  const fv = $("#form-vendre");
  const majProvenance = () => {
    const occ = fv.etat.value === "occasion";
    const part = fv.type.value === "particulier";
    // un particulier ne vend que de l'occasion / revente
    if (part && !occ) fv.etat.value = "occasion";
    $("#provenance").hidden = fv.etat.value !== "occasion";
    $$(".pro-only").forEach(el => el.hidden = part);
    const gros = Number(fv.prix.value) >= SEUIL;
    $$(".seuil-req").forEach(el => el.hidden = !gros);
    $("#seuil-info").textContent = gros
      ? "À partir de 50 000 F : n° de série et justificatif obligatoires."
      : "Sous 50 000 F : seule la pièce d'identité est obligatoire.";
  };
  fv.etat.addEventListener("change", majProvenance);
  fv.type.addEventListener("change", majProvenance);
  fv.prix.addEventListener("input", majProvenance);
  majProvenance();

  const lireFichier = file => new Promise(res => {
    if (!file || !file.size) return res(null);
    if (!file.type.startsWith("image/") || file.size > 1.5e6) return res({ nom: file.name, data: null });
    const r = new FileReader();
    r.onload = () => res({ nom: file.name, data: r.result });
    r.onerror = () => res({ nom: file.name, data: null });
    r.readAsDataURL(file);
  });

  fv.addEventListener("submit", async e => {
    e.preventDefault();
    const msg = $("#vendre-msg");
    const f = Object.fromEntries(new FormData(fv));
    const occ = f.etat === "occasion";
    msg.className = "msg err";

    const gros = Number(f.prix) >= SEUIL;
    const aJustif = !!(fv.doc_justif.files[0] && fv.doc_justif.files[0].size);
    if (occ) {
      if (!fv.doc_id.files[0]) return msg.textContent = "La pièce d'identité est obligatoire pour une revente.";
      if (gros && !normSerie(f.serie)) return msg.textContent = "À partir de 50 000 F, indique le n° de série ou le VIN.";
      if (gros && !aJustif) return msg.textContent = "À partir de 50 000 F, ajoute la carte grise ou le ticket / la facture d'achat.";
      if (!fv.honneur.checked) return msg.textContent = "Coche la déclaration sur l'honneur.";
    }

    const a = {
      id: "u" + Date.now(), nom: f.nom, cat: f.cat, compat: f.compat, ref: f.ref, etat: f.etat,
      prix: Number(f.prix), qte: Number(f.qte), vendeur: f.vendeur, type: f.type, ntahiti: f.ntahiti,
      commune: f.commune, ile: f.ile, tel: f.tel, maj: Date.now(), mine: true,
      statut: occ ? "attente" : "publie"
    };
    if (occ) {
      const [di, dj] = await Promise.all([lireFichier(fv.doc_id.files[0]), lireFichier(fv.doc_justif.files[0])]);
      Object.assign(a, { serie: f.serie, justif_type: aJustif ? f.justif_type : "",
        doc_id_nom: di?.nom, doc_id: di?.data, doc_justif_nom: dj?.nom, doc_justif: dj?.data });
    }
    annonces.unshift(a);
    if (!store.set("annonces", annonces)) { // trop lourd : on garde seulement le nom des fichiers
      delete a.doc_id; delete a.doc_justif; save();
    }

    msg.className = "msg okm";
    if (occ && estVole(a.serie)) {
      msg.className = "msg err";
      msg.textContent = "⚠ Ce n° de série figure sur la liste des pièces signalées volées. L'annonce est bloquée et transmise à la vérification.";
    } else {
      msg.textContent = occ
        ? "✔ Annonce envoyée. Elle sera visible après vérification de ta pièce d'identité (en général sous 24 h)."
          + (aJustif ? " Badge « Provenance vérifiée » demandé." : "")
        : "✔ Pièce publiée !";
    }
    fv.reset(); majProvenance(); renderMesAnnonces();
  });

  function statutBadge(a) {
    if (estVole(a.serie)) return `<span class="badge b-vol">🚨 Bloquée — n° signalé volé</span>`;
    return { publie: `<span class="badge b-verif">✔ En ligne</span>`,
             attente: `<span class="badge b-attente">⏳ En vérification</span>`,
             refuse: `<span class="badge b-refus">✖ Refusée</span>` }[a.statut];
  }
  function renderMesAnnonces() {
    const mine = annonces.filter(a => a.mine);
    $("#mes-annonces").innerHTML = mine.length ? mine.map(a => `
      <div class="card"><div class="h"><div class="t">${catIco(a.cat)} ${esc(a.nom)}</div><div class="p">${prix(a.prix)}</div></div>
      <div class="m">${a.etat === "neuf" ? "Neuf" : "Occasion"} · Qté ${a.qte} · ${esc(a.commune)}, ${esc(a.ile)}</div>
      ${statutBadge(a)}${a.motif ? `<div class="m">Motif : ${esc(a.motif)}</div>` : ""}</div>`).join("")
      : `<p class="muted">Tu n'as pas encore d'annonce.</p>`;
  }

  // ---------- signaler un vol ----------
  $("#form-vol").addEventListener("submit", e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    vols.unshift(f);
    const touchees = annonces.filter(a => normSerie(a.serie) === normSerie(f.serie));
    save(); e.target.reset();
    const m = $("#vol-msg");
    m.className = "msg okm";
    m.textContent = "✔ Signalement enregistré." + (touchees.length ? ` ${touchees.length} annonce(s) correspondante(s) bloquée(s).` : "");
    renderVols();
  });
  function renderVols() {
    $("#vols").innerHTML = vols.length ? vols.map(v => `
      <div class="card"><div class="t">🚨 ${esc(v.serie)}</div>
      <div class="m">${esc(v.desc)}${v.date ? " · " + esc(v.date) : ""}${v.plainte ? " · Plainte " + esc(v.plainte) : ""}</div></div>`).join("")
      : `<p class="muted">Aucun signalement.</p>`;
  }

  // ---------- vérification (modérateur) ----------
  function docHtml(label, nom, data) {
    if (!nom) return `<div>${label} : <span class="no">manquant</span></div>`;
    return `<div>${label} : ${esc(nom)}${data ? `<br><img src="${data}" alt="${esc(label)}">` : ""}</div>`;
  }
  function renderAdmin() {
    const att = annonces.filter(a => a.statut === "attente");
    $("#admin").innerHTML = att.length ? att.map(a => `
      <div class="card">
        <div class="h"><div class="t">${catIco(a.cat)} ${esc(a.nom)}</div><div class="p">${prix(a.prix)}</div></div>
        <div class="m">${esc(a.vendeur)} (${esc(a.type)}) · ${esc(a.commune)}, ${esc(a.ile)} · 📞 ${esc(a.tel)}</div>
        <div class="docs">
          <div><b>N° série / VIN :</b> ${a.serie ? esc(a.serie) : "non renseigné"}</div>
          ${docHtml("Pièce d'identité", a.doc_id_nom, a.doc_id)}
          ${a.justif_type
            ? `<div><b>Justificatif :</b> ${esc(JUSTIF[a.justif_type] || a.justif_type)}</div>${docHtml("Photo", a.doc_justif_nom, a.doc_justif)}`
            : `<div><b>Justificatif :</b> aucun (sous 50 000 F) → badge « vendeur identifié »</div>`}
        </div>
        ${estVole(a.serie) ? `<div class="alert">🚨 Ce n° correspond à un signalement de vol — ne pas publier, contacter les autorités.</div>` : ""}
        <div class="actions">
          <button class="btn g" data-ok="${esc(a.id)}" ${estVole(a.serie) ? "disabled" : ""}>✔ Valider</button>
          <button class="btn red" data-ko="${esc(a.id)}">✖ Refuser</button>
        </div>
      </div>`).join("")
      : `<p class="empty">Aucune annonce en attente 🌺</p>`;

    $$("[data-ok]").forEach(b => b.addEventListener("click", () => {
      const a = annonces.find(x => x.id === b.dataset.ok); a.statut = "publie"; a.maj = Date.now(); save(); render();
    }));
    $$("[data-ko]").forEach(b => b.addEventListener("click", () => {
      const a = annonces.find(x => x.id === b.dataset.ko);
      a.statut = "refuse";
      a.motif = estVole(a.serie) ? "n° de série signalé volé" : "documents non conformes ou illisibles";
      save(); render();
    }));
  }

  // ---------- rendu global ----------
  function render() { renderResults(); renderDemandes(); renderMesAnnonces(); renderVols(); renderAdmin(); }
  render();

  // ---------- hors ligne (PWA) ----------
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
