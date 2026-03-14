(function () {
  "use strict";

  /* ══════════════════════════════════════
     CONSTANTES GLOBALES
  ══════════════════════════════════════ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // ← REMONTÉ en haut — était utilisé avant déclaration

  /* ══════════════════════════════════════
     PRELOADER
  ══════════════════════════════════════ */
  const preNum    = document.getElementById("preNum");
  const preBar    = document.getElementById("preBar");
  const preLabel  = document.getElementById("preLabel");
  const preloader = document.getElementById("preloader");

  const labels = [
    "Initialisation…",
    "Chargement des données…",
    "Préparation de l'interface…",
    "Presque prêt…",
    "Lancement !",
  ];

  let p = 0;
  const iv = setInterval(() => {
    p = Math.min(p + Math.random() * 9 + 2, 100);
    preNum.textContent = Math.floor(p);
    preBar.style.width = p + "%";
    preloader.setAttribute("aria-valuenow", Math.floor(p));
    preLabel.textContent = labels[Math.min(Math.floor(p / 25), 4)];

    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        preloader.classList.add("hidden");
        document.getElementById("heroBg").classList.add("loaded");
        triggerReveal();
        animateStats(); // ← AJOUTÉ — lance les compteurs stats après le preloader
      }, 350);
    }
  }, 55);

  /* ══════════════════════════════════════
     NAV — effet fond au scroll
  ══════════════════════════════════════ */
  // ← AJOUTÉ — ajoute un fond semi-transparent sur la nav quand on scrolle
  const nav = document.querySelector("nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      nav.style.background = "rgba(8, 8, 9, 0.88)";
      nav.style.backdropFilter = "blur(12px)";
      nav.style.borderBottom = "1px solid rgba(245, 240, 232, 0.06)";
    } else {
      nav.style.background = "";
      nav.style.backdropFilter = "";
      nav.style.borderBottom = "";
    }
  }, { passive: true });

  /* ══════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════ */
  function triggerReveal() {
    const els = document.querySelectorAll(".r");
    let revealed = 0;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("v");
            obs.unobserve(en.target);
            if (++revealed === els.length) obs.disconnect();
          }
        });
      },
      { threshold: 0.08 },
    );

    els.forEach((el) => obs.observe(el));
  }

  /* ══════════════════════════════════════
     STATS — animation compteurs
  ══════════════════════════════════════ */
  // ← AJOUTÉ — anime les chiffres des stat-big au scroll
  function animateCounter(el, target, suffix, duration = 1200) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (eased * target).toFixed(1)
        : Math.floor(eased * target);
      el.firstChild.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function animateStats() {
    const statsObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        statsObs.unobserve(en.target);

        const big = en.target.querySelector(".stat-big");
        if (!big) return;

        const unitEl = big.querySelector(".unit");
        const unit   = unitEl ? unitEl.textContent : "";
        const raw    = big.textContent.replace(unit, "").trim();
        const target = parseFloat(raw);

        if (isNaN(target)) return;

        // Reconstruit le contenu pour éviter d'écraser le .unit
        big.innerHTML = `${raw}<span class="unit">${unit}</span>`;
        animateCounter(big, target, unit);
      });
    }, { threshold: 0.4 });

    document.querySelectorAll(".stat-block").forEach((b) => statsObs.observe(b));
  }

  /* ══════════════════════════════════════
     MARQUEE
  ══════════════════════════════════════ */
  const mItems = [
    "Toi tu crées",
    "Flexo récupère",
    "Implacable",
    "Invulnérable",
    "Justice automatique",
    "Relance J+8",
    "Mise en demeure J+30",
    "Injonction J+45",
    "Huissier J+60",
    "Ton argent te revient",
  ];

  document.getElementById("marqueeTrack").innerHTML = [...mItems, ...mItems]
    .map(
      (t) => `
        <span class="marquee-item">
          <span class="marquee-dot" aria-hidden="true"></span>${t}
        </span>`,
    )
    .join("");

  /* ══════════════════════════════════════
     STRIP CARDS
  ══════════════════════════════════════ */
  const cards = [
    { label: "CA en attente",          val: "4 200", unit: "€" },
    { label: "Payé ce mois",           val: "8 750", unit: "€" },
    { label: "En litige",              val: "1 800", unit: "€" },
    { label: "Relances actives",       val: "3",     unit: ""  },
    { label: "Taux récupération",      val: "87",    unit: "%" },
    { label: "Taux journalier moyen",  val: "480",   unit: "€" },
    { label: "Factures envoyées",      val: "24",    unit: ""  },
    { label: "Délai moyen paiement",   val: "18",    unit: "j" },
  ];

  // ← MODIFIÉ — gradient cohérent avec le nouveau coral #e85d3f
  const gradients = [
    "rgba(107, 157, 232, .25)",
    "rgba(232, 93,  63,  .25)",
    "rgba(139, 114, 212, .25)",
  ];

  document.getElementById("stripTrack").innerHTML = [...cards, ...cards]
    .map(
      (c, i) => `
        <div class="strip-card">
          <div class="strip-card-bg"
               style="background: linear-gradient(135deg, ${gradients[i % 3]} 0%, transparent 100%)"
               aria-hidden="true">
          </div>
          <div class="strip-card-label">${c.label}</div>
          <div class="strip-card-val">${c.val}<span class="unit">${c.unit}</span></div>
        </div>`,
    )
    .join("");

  /* ══════════════════════════════════════
     FOUNDER SPOTS — compte à rebours animé
  ══════════════════════════════════════ */
  // ← AJOUTÉ — simule une réduction progressive des places disponibles
  const founderSpotsEls = document.querySelectorAll("#founderSpots");
  let spots = 47;

  function tickSpots() {
    const delay = 45000 + Math.random() * 90000; // toutes les 45-135 secondes
    setTimeout(() => {
      if (spots <= 1) return;
      spots--;
      founderSpotsEls.forEach((el) => (el.textContent = spots));
      tickSpots();
    }, delay);
  }
  tickSpots();

  /* ══════════════════════════════════════
     SMOOTH SCROLL — délégation unique
  ══════════════════════════════════════ */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-scroll]");
    if (!btn) return;
    const target = document.getElementById(btn.dataset.scroll);
    target?.scrollIntoView({ behavior: "smooth" });
  });

  /* ══════════════════════════════════════
     HELPER — soumission waitlist générique
  ══════════════════════════════════════ */
  // ← AJOUTÉ — fonction partagée entre les deux formulaires
  async function submitWaitlist({ email, rowEl, successEl, btnEl, originalBtnText }) {
    btnEl.textContent = "...";
    btnEl.disabled = true;

    try {
      const res  = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* JSON invalide */ }

      if (!res.ok) throw new Error((data && data.error) || `Erreur ${res.status}`);

      // Succès
      rowEl.style.display    = "none";
      successEl.textContent  = "✓ Inscription confirmée — on te tient au courant.";
      successEl.style.color  = "#6ddba8";
      successEl.style.display = "block";

      // ← Synchronise le compteur visible
      const heroCount = document.getElementById("heroCount");
      if (heroCount) heroCount.textContent = parseInt(heroCount.textContent) + 1;

    } catch (err) {
      rowEl.style.borderColor   = "var(--coral)";
      successEl.textContent     = `✗ ${err.message}`;
      successEl.style.color     = "var(--coral)";
      successEl.style.display   = "block";
      setTimeout(() => (rowEl.style.borderColor = ""), 2000);
    } finally {
      btnEl.textContent = originalBtnText;
      btnEl.disabled    = false;
    }
  }

  /* ══════════════════════════════════════
     FORMULAIRE HERO
  ══════════════════════════════════════ */
  document.getElementById("heroWaitlistForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input   = document.getElementById("heroEmailInput");
    const row     = input.closest(".hero-waitlist-row");
    const success = document.getElementById("heroWlSuccess");
    const btn     = e.target.querySelector('button[type="submit"]');
    const email   = input.value.trim();

    if (!EMAIL_RE.test(email)) {
      row.style.borderColor = "var(--coral)";
      input.focus();
      setTimeout(() => (row.style.borderColor = ""), 1500);
      return;
    }

    // Pré-remplit le formulaire du bas pour fluidifier le parcours
    const mainInput = document.getElementById("emailInput");
    if (mainInput) mainInput.value = email;

    await submitWaitlist({
      email,
      rowEl: row,
      successEl: success,
      btnEl: btn,
      originalBtnText: "Accès anticipé →", // ← MODIFIÉ — texte correct
    });
  });

  /* ══════════════════════════════════════
     FORMULAIRE PRINCIPAL (CTA bas de page)
  ══════════════════════════════════════ */
  const form      = document.getElementById("waitlistForm");
  const input     = document.getElementById("emailInput");
  const row       = form.querySelector(".waitlist-row");
  const successEl = document.getElementById("wlSuccess");
  const submitBtn = form.querySelector(".btn-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!EMAIL_RE.test(email)) {
      row.style.borderColor = "var(--coral)";
      input.focus();
      setTimeout(() => (row.style.borderColor = ""), 1500);
      return;
    }

    await submitWaitlist({
      email,
      rowEl: row,
      successEl,
      btnEl: submitBtn,
      originalBtnText: "Je veux être payé →", // ← MODIFIÉ — texte correct
    });
  });

})();
