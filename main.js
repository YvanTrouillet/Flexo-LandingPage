(function () {
  "use strict";

  /* ══════════════════════════════════════
     PRELOADER
  ══════════════════════════════════════ */
  const preNum = document.getElementById("preNum");
  const preBar = document.getElementById("preBar");
  const preLabel = document.getElementById("preLabel");
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
      }, 350);
    }
  }, 55);
  
  /* ── HERO WAITLIST (même logique que le formulaire principal) ── */
document.getElementById('heroWaitlistForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input   = document.getElementById('heroEmailInput');
  const row     = input.closest('.hero-waitlist-row');
  const success = document.getElementById('heroWlSuccess');
  const btn     = e.target.querySelector('button[type="submit"]');
  const email   = input.value.trim();

  if (!EMAIL_RE.test(email)) {
    row.style.borderColor = 'var(--coral)';
    input.focus();
    setTimeout(() => (row.style.borderColor = ''), 1500);
    return;
  }

  btn.textContent = '...';
  btn.disabled = true;

  try {
    const res  = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error((data && data.error) || `Erreur ${res.status}`);

    row.style.display = 'none';
    success.style.display = 'block';

    // Synchronise aussi le formulaire du bas si visible
    document.getElementById('emailInput').value = email;

  } catch (err) {
    row.style.borderColor = 'var(--coral)';
    success.textContent   = `✗ ${err.message}`;
    success.style.color   = 'var(--coral)';
    success.style.display = 'block';
  } finally {
    btn.textContent = 'Accès anticipé →';
    btn.disabled = false;
  }
});


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
            // Déconnecte l'observer quand tous les éléments sont révélés
            if (++revealed === els.length) obs.disconnect();
          }
        });
      },
      { threshold: 0.08 },
    );

    els.forEach((el) => obs.observe(el));
  }

  /* ══════════════════════════════════════
     MARQUEE
  ══════════════════════════════════════ */
  const mItems = [
  'Toi tu crées',
  'Flexo récupère',
  'Implacable',
  'Invulnérable',
  'Justice automatique',
  'Relance J+8',
  'Mise en demeure J+30',
  'Injonction J+45',
  'Huissier J+60',
  'Ton argent te revient',
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
    { label: "CA en attente", val: "4 200", unit: "€" },
    { label: "Payé ce mois", val: "8 750", unit: "€" },
    { label: "En litige", val: "1 800", unit: "€" },
    { label: "Relances actives", val: "3", unit: "" },
    { label: "Taux récupération", val: "87", unit: "%" },
    { label: "Taux journalier", val: "480", unit: "€" },
    { label: "Factures envoyées", val: "24", unit: "" },
    { label: "Jours moyens paiement", val: "18", unit: "j" },
  ];

  const gradients = [
    "rgba(107,157,232,.3)",
    "rgba(232,107,95,.3)",
    "rgba(139,114,212,.3)",
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
     SMOOTH SCROLL — délégation unique
  ══════════════════════════════════════ */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-scroll]");
    if (!btn) return;
    const target = document.getElementById(btn.dataset.scroll);
    target?.scrollIntoView({ behavior: "smooth" });
  });

  /* ══════════════════════════════════════
   WAITLIST
══════════════════════════════════════ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const form = document.getElementById("waitlistForm");
  const input = document.getElementById("emailInput");
  const row = form.querySelector(".waitlist-row");
  const successEl = document.getElementById("wlSuccess");
  const submitBtn = form.querySelector(".btn-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = input.value.trim();

    // Validation côté client
    if (!EMAIL_RE.test(email)) {
      row.style.borderColor = "var(--coral)";
      input.focus();
      setTimeout(() => (row.style.borderColor = ""), 1500);
      return;
    }

    submitBtn.textContent = "...";
    submitBtn.disabled = true;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // On récupère le texte brut pour éviter le crash si body vide
      const text = await res.text();
      let data = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // Si ce n'est pas du JSON valide, on laisse data = null
        }
      }

      if (!res.ok) {
        const message =
          (data && data.error) || `Erreur serveur (${res.status})`;
        throw new Error(message);
      }

      // Succès
      row.style.display = "none";
      successEl.textContent =
        "✓ Inscription confirmée — on te tient au courant.";
      successEl.style.color = "#6ddba8";
      successEl.style.display = "block";
    } catch (err) {
      row.style.borderColor = "var(--coral)";
      successEl.textContent = `✗ ${err.message}`;
      successEl.style.color = "var(--coral)";
      successEl.style.display = "block";

      setTimeout(() => {
        row.style.borderColor = "";
      }, 2000);
    } finally {
      submitBtn.textContent = "Rejoindre →";
      submitBtn.disabled = false;
    }
  });
})();
