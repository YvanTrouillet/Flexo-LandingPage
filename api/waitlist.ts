export default async function handler(req, res) {

  // Seules les requêtes POST sont acceptées
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validation basique côté serveur
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Email invalide.' });
  }

  const API_KEY      = process.env.BREVO_API_KEY;
  const LIST_ID      = process.env.BREVO_LIST_ID;
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
  const SENDER_NAME  = process.env.BREVO_SENDER_NAME;

  const headers = {
    'Content-Type': 'application/json',
    'api-key': API_KEY,
  };

  try {

    /* ── ÉTAPE 1 — Créer ou mettre à jour le contact ── */
    const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        listIds: [Number(LIST_ID)],
        updateEnabled: true,           // si le contact existe déjà, on le met à jour
        attributes: {
          SOURCE: 'waitlist-flexo',
          SIGNUP_DATE: new Date().toISOString().split('T')[0],
        },
      }),
    });

    // 204 = contact déjà existant mis à jour, 201 = nouveau contact
    if (!contactRes.ok && contactRes.status !== 204) {
      const err = await contactRes.json();
      throw new Error(err.message || 'Erreur création contact');
    }

    /* ── ÉTAPE 2 — Envoyer l'email de confirmation ── */
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email }],
        subject: '✅ Tu es sur la liste — Flexo',
        htmlContent: `
          <!DOCTYPE html>
          <html lang="fr">
          <head><meta charset="UTF-8"/></head>
          <body style="background:#080809;color:#f2ede8;font-family:'Helvetica Neue',sans-serif;padding:48px 32px;max-width:560px;margin:0 auto;">
            <p style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#e86b5f;margin-bottom:24px;">
              Flexo — Waitlist
            </p>
            <h1 style="font-size:40px;font-weight:800;line-height:.95;letter-spacing:-.03em;margin-bottom:24px;">
              Tu es<br><em style="font-weight:200;color:rgba(242,237,232,.5)">bien</em><br>inscrit·e.
            </h1>
            <p style="font-size:15px;font-weight:300;font-style:italic;color:rgba(242,237,232,.55);line-height:1.7;margin-bottom:32px;">
              On te prévient en priorité au lancement.<br>
              D'ici là, tes impayés ont encore un avenir — mais plus pour longtemps.
            </p>
            <hr style="border:none;border-top:1px solid rgba(242,237,232,.08);margin-bottom:32px;"/>
            <p style="font-size:11px;color:rgba(242,237,232,.25);letter-spacing:.06em;">
              Tu reçois cet email car tu t'es inscrit·e sur <strong style="color:rgba(242,237,232,.4)">flexo.fr</strong>.<br>
              Pour te désinscrire, <a href="{{unsubscribeLink}}" style="color:#e86b5f;">clique ici</a>.
            </p>
          </body>
          </html>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.json();
      throw new Error(err.message || "Erreur envoi email de confirmation");
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('[Waitlist Error]', error.message);
    return res.status(500).json({ error: 'Une erreur est survenue. Réessaie.' });
  }
}