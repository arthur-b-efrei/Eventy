// Envoi d'emails avec l'API HTTP de Brevo (https://www.brevo.com).
// On passe par HTTPS plutôt que par SMTP : beaucoup d'hébergeurs (Render, DigitalOcean…)
// bloquent les ports SMTP, alors que HTTPS passe partout.
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export async function envoyerEmail({ to, subject, html, text }) {
  const cle = process.env.BREVO_API_KEY;

  // Pas de clé en développement : on affiche l'email dans le terminal au lieu de l'envoyer
  if (!cle) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BREVO_API_KEY manquante : impossible d'envoyer des emails en production");
    }
    console.log(`\n----- EMAIL (mode dev, pas envoyé) -----\nÀ : ${to}\nSujet : ${subject}\n\n${text}\n----------------------------------------\n`);
    return;
  }

  const reponse = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": cle,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.MAIL_FROM_EMAIL,
        name: process.env.MAIL_FROM_NAME || "Eventy",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!reponse.ok) {
    const detail = await reponse.text();
    throw new Error(`Brevo a refusé l'envoi (${reponse.status}) : ${detail}`);
  }
}
