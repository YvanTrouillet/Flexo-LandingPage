/* eslint-disable @typescript-eslint/no-explicit-any */
declare const process: { env: Record<string, string | undefined> };

export default async function handler(req: any, res: any) {
  // Seules les requêtes POST sont acceptées
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  // Validation basique côté serveur
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Email invalide." });
  }

  const API_KEY = process.env.BREVO_API_KEY;
  const LIST_ID = process.env.BREVO_LIST_ID;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "api-key": API_KEY ?? "",
  };

  try {
    /* ── ÉTAPE 1 — Créer ou mettre à jour le contact ── */
    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        listIds: [Number(LIST_ID)],
        updateEnabled: true, // si le contact existe déjà, on le met à jour
        attributes: {
          SOURCE: "waitlist-flexo",
          SIGNUP_DATE: new Date().toISOString().split("T")[0],
        },
      }),
    });

    // 204 = contact déjà existant mis à jour, 201 = nouveau contact
    if (!contactRes.ok && contactRes.status !== 204) {
      const err = await contactRes.json();
      throw new Error(err.message || "Erreur création contact");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(
      "[Waitlist Error]",
      error instanceof Error ? error.message : error,
    );
    return res
      .status(500)
      .json({ error: "Une erreur est survenue. Réessaie." });
  }
}
