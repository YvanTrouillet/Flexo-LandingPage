(function () {
  'use strict';

  /* ══════════════════════════════════════
     PRELOADER
  ══════════════════════════════════════ */
  const preNum    = document.getElementById('preNum');
  const preBar    = document.getElementById('preBar');
  const preLabel  = document.getElementById('preLabel');
  const preloader = document.getElementById('preloader');

  const labels = [
    'Initialisation…',
    'Chargement des données…',
    "Préparation de l'interface…",
    'Presque prêt…',
    'Lancement !',
  ];

  let p = 0;

  const iv = setInterval(() => {
    p = Math.min(p + Math.random() * 9 + 2, 100);

    preNum.textContent = Math.floor(p);
    preBar.style.width = p + '%';
    preloader.setAttribute('aria-valuenow', Math.floor(p));
    preLabel.textContent = labels[Math.min(Math.floor(p / 25), 4)];

    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        preloader.classList.add('hidden');
        document.getElementById('heroBg').classList.add('loaded');
        triggerReveal();
      }, 350);
    }
  }, 55);


  /* ══════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════ */
  function triggerReveal() {
    const els = document.querySelectorAll('.r');
    let revealed = 0;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('v');
          obs.unobserve(en.target);
          // Déconnecte l'observer quand tous les éléments sont révélés
          if (++revealed === els.length) obs.disconnect();
        }
      });
    }, { threshold: 0.08 });

    els.forEach(el => obs.observe(el));
  }


  /* ══════════════════════════════════════
     MARQUEE
  ══════════════════════════════════════ */
  const mItems = [
    'Facture envoyée',
    'Relance J+8',
    'Relance J+15',
    'Mise en demeure J+30',
    'Injonction de payer J+45',
    'Huissier J+60',
    'Legal Shield',
    'Mini-compta URSSAF',
    'Dashboard financier',
    'Impayés récupérés',
  ];

  document.getElementById('marqueeTrack').innerHTML =
    [...mItems, ...mItems]
      .map(t => `
        <span class="marquee-item">
          <span class="marquee-dot" aria-hidden="true"></span>${t}
        </span>`)
      .join('');


  /* ══════════════════════════════════════
     STRIP CARDS
  ══════════════════════════════════════ */
  const cards = [
    { label: 'CA en attente',         val: '4 200', unit: '€' },
    { label: 'Payé ce mois',          val: '8 750', unit: '€' },
    { label: 'En litige',             val: '1 800', unit: '€' },
    { label: 'Relances actives',      val: '3',     unit: ''  },
    { label: 'Taux récupération',     val: '87',    unit: '%' },
    { label: 'Taux journalier',       val: '480',   unit: '€' },
    { label: 'Factures envoyées',     val: '24',    unit: ''  },
    { label: 'Jours moyens paiement', val: '18',    unit: 'j' },
  ];

  const gradients = [
    'rgba(107,157,232,.3)',
    'rgba(232,107,95,.3)',
    'rgba(139,114,212,.3)',
  ];

  document.getElementById('stripTrack').innerHTML =
    [...cards, ...cards]
      .map((c, i) => `
        <div class="strip-card">
          <div class="strip-card-bg"
               style="background: linear-gradient(135deg, ${gradients[i % 3]} 0%, transparent 100%)"
               aria-hidden="true">
          </div>
          <div class="strip-card-label">${c.label}</div>
          <div class="strip-card-val">${c.val}<span class="unit">${c.unit}</span></div>
        </div>`)
      .join('');


  /* ══════════════════════════════════════
     SMOOTH SCROLL — délégation unique
  ══════════════════════════════════════ */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-scroll]');
    if (!btn) return;
    const target = document.getElementById(btn.dataset.scroll);
    target?.scrollIntoView({ behavior: 'smooth' });
  });


  /* ══════════════════════════════════════
     WAITLIST
  ══════════════════════════════════════ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.getElementById('waitlistForm').addEventListener('submit', e => {
    e.preventDefault();

    const input = document.getElementById('emailInput');
    const row   = input.closest('.waitlist-row');

    if (!EMAIL_RE.test(input.value.trim())) {
      row.style.borderColor = 'var(--coral)';
      input.focus();
      setTimeout(() => (row.style.borderColor = ''), 1500);
      return;
    }

    row.style.display = 'none';
    document.getElementById('wlSuccess').style.display = 'block';

    // TODO: envoyer l'email à ton backend
    // fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email: input.value.trim() }) });
  });

})();
