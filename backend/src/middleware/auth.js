import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Vérifie un token et renvoie { id, role } du user, ou { erreur } si le token ne vaut plus rien.
// Sert à "protect" (routes HTTP) et à la connexion WebSocket de la discussion.
export async function userDuToken(token) {
  let contenu;
  try {
    // Vérifie que le token a bien été signé par nous et qu'il n'a pas expiré
    contenu = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return { erreur: "Token invalide ou expiré" };
  }

  // Le compte existe-t-il toujours, et le token date-t-il d'après le dernier changement de mot de passe ?
  const user = await User.findById(contenu.id).select("role mdp_change_le");
  if (!user) {
    return { erreur: "Compte introuvable" };
  }
  if (user.mdp_change_le && contenu.iat * 1000 < user.mdp_change_le.getTime()) {
    return { erreur: "Mot de passe changé, reconnecte-toi" };
  }
  return { id: user._id.toString(), role: user.role };
}

// À mettre devant les routes réservées aux users connectés.
// Le front doit envoyer l'en-tête : Authorization: Bearer <token>
export default async function protect(req, res, next) {
  const entete = req.headers.authorization || "";

  if (!entete.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non connecté" });
  }

  try {
    const resultat = await userDuToken(entete.split(" ")[1]);
    if (resultat.erreur) {
      return res.status(401).json({ message: resultat.erreur });
    }

    req.user = resultat;
    next(); // on laisse passer vers la route
  } catch (error) {
    console.error("protect :", error.message);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
