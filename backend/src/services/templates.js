// Empêche d'injecter du HTML dans l'email via le prénom
function echapper(texte) {
  return String(texte).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Email avec le code de vérification, aux couleurs d'Eventy.
// Mise en page en tableaux et styles "inline" : c'est ce que les clients mail comprennent le mieux.
export function emailCode(prenom, code, minutes) {
  const nom = echapper(prenom);
  const chiffres = code.split("").join("&nbsp;");

  const subject = `${code} est ton code Eventy`;

  const text = `Salut ${prenom},

Voici ton code pour vérifier ton adresse email sur Eventy : ${code}

Il est valable ${minutes} minutes.
Si tu n'as pas créé de compte, ignore simplement cet email.

L'équipe Eventy`;

  const html = `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#F4F5F8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F8;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:20px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#1A1C2E;">
        <tr><td style="background:#3A3DFF;padding:26px 32px;">
          <span style="font-size:26px;font-weight:bold;color:#FFFFFF;letter-spacing:-1px;">&#9679; eventy</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:bold;">Salut ${nom},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5D6178;">Voici ton code pour vérifier ton adresse email. Il reste une place à la table, c'est la tienne.</p>
          <div style="background:#F4F5F8;border-radius:14px;padding:20px;text-align:center;font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:bold;letter-spacing:6px;color:#3A3DFF;">${chiffres}</div>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#8B8FA3;">Ce code est valable ${minutes} minutes. Si tu n'as pas créé de compte sur Eventy, ignore simplement cet email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
