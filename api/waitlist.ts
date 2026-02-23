// ============================================================
// Flexo Waitlist — Vercel Edge Function
// ============================================================
//
// MISE EN PRODUCTION — 3 étapes :
//
// 1. Créer une Audience dans le Resend Dashboard
//    (https://resend.com/audiences) → copier l'Audience ID
//
// 2. Ajouter les variables d'environnement dans Vercel Dashboard
//    Settings → Environment Variables :
//      - RESEND_API_KEY      (ex: re_xxxxxxxxxxxx)
//      - RESEND_AUDIENCE_ID  (ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
//
// 3. Déployer : vercel --prod
//
// ============================================================

export const config = { runtime: "edge" };

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// --------------- Email template ---------------

function confirmationEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#6366F1;padding:32px 40px;text-align:center;">
              <span style="font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">Flexo</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 24px;font-size:24px;color:#1a1a2e;line-height:1.3;">Bienvenue sur la liste !</h1>
              <p style="margin:0 0 16px;font-size:16px;color:#4a4a68;line-height:1.6;">
                C'est confirmé : tu fais maintenant partie des premiers freelances à rejoindre Flexo. Merci pour ta confiance, ça compte énormément pour nous.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#4a4a68;line-height:1.6;">
                Fini les relances manuelles et les impayés qui traînent. Flexo automatise tout : de la création de facture jusqu'à l'escalade juridique si nécessaire.
              </p>
              <p style="margin:0 0 16px;font-size:16px;color:#4a4a68;line-height:1.6;font-weight:600;">
                Et maintenant ?
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#4a4a68;line-height:1.6;">
                On te prévient en avant-première dès que l'accès est ouvert. Les 500 premiers inscrits bénéficient du prix bloqué à vie — et tu en fais partie.
              </p>
              <p style="margin:0;font-size:16px;color:#4a4a68;line-height:1.6;">À très vite,</p>
              <p style="margin:4px 0 0;font-size:16px;color:#1a1a2e;font-weight:bold;">— L'équipe Flexo</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #e5e5eb;">
              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">
                Le seul outil de facturation qui va au tribunal pour récupérer ton argent.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#c4c4cc;text-align:center;">
                © 2025 Flexo — Tous droits réservés
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --------------- Handler ---------------

export default async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Méthode non autorisée" }, 405);
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return json({ error: "Configuration serveur manquante" }, 500);
  }

  // Parse body
  let email: string;
  try {
    const body = await req.json();
    email = (body.email || "").trim().toLowerCase();
  } catch {
    return json({ error: "Body JSON invalide" }, 400);
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Adresse email invalide" }, 400);
  }

  // --- 1. Add contact to Resend Audience ---
  let alreadyExists = false;
  try {
    const contactRes = await fetch(
      `https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      },
    );

    if (!contactRes.ok) {
      const errorBody = await contactRes.text();
      // Handle "already exists" as a success
      if (
        errorBody.toLowerCase().includes("already") ||
        contactRes.status === 409
      ) {
        alreadyExists = true;
      } else {
        console.error("Resend Audience error:", contactRes.status, errorBody);
        return json({ error: "Erreur lors de l'inscription" }, 502);
      }
    }
  } catch (err) {
    console.error("Resend Audience fetch error:", err);
    return json({ error: "Erreur réseau vers Resend" }, 502);
  }

  // --- 2. Send confirmation email ---
  try {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Flexo <bonjour@flexo.app>",
        to: [email],
        subject: "Tu es sur la liste Flexo 🎉",
        html: confirmationEmailHtml(email),
      }),
    });

    if (!emailRes.ok) {
      const errorBody = await emailRes.text();
      console.error("Resend Email error:", emailRes.status, errorBody);
      // Don't fail the whole request — the contact was added
    }
  } catch (err) {
    console.error("Resend Email fetch error:", err);
  }

  return json({ success: true, alreadyExists });
}
