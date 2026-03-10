export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { email } = body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide." });
    }

    const API_KEY = process.env.BREVO_API_KEY;
    const LIST_ID = process.env.BREVO_LIST_ID;

    const headers = {
      "Content-Type": "application/json",
      "api-key": API_KEY,
    };

    // 1. Créer/ajouter contact
    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email,
        listIds: [parseInt(LIST_ID)],
        updateEnabled: true,
        attributes: {
          SOURCE: "waitlist-flexo",
          SIGNUP_DATE: new Date().toISOString().split("T")[0],
        },
      }),
    });

    if (!contactRes.ok && contactRes.status !== 204) {
      const err = await contactRes.text();
      console.error("Contact error:", contactRes.status, err);
      return res.status(500).json({ error: "Erreur création contact." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Waitlist Error]", error);
    return res.status(500).json({ error: "Erreur serveur. Réessaie." });
  }
}
