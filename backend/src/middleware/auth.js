import jwt from "jsonwebtoken";
import User from "../models/User.js";

// À mettre devant les routes réservées aux users connectés.
// Le front doit envoyer l'en-tête : Authorization: Bearer <token>
export default async function protect(req, res, next) {
  const entete = req.headers.authorization || "";

  if (!entete.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non connecté" });
  }

  const token = entete.split(" ")[1];

  let contenu;
  try {
    // Vérifie que le token a bien été signé par nous et qu'il n'a pas expiré
    contenu = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }

  try {
    // Le compte existe-t-il toujours, et le token date-t-il d'après le dernier changement de mot de passe ?
    const user = await User.findById(contenu.id).select("role mdp_change_le");
    if (!user) {
      return res.status(401).json({ message: "Compte introuvable" });
    }
    if (user.mdp_change_le && contenu.iat * 1000 < user.mdp_change_le.getTime()) {
      return res.status(401).json({ message: "Mot de passe changé, reconnecte-toi" });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next(); // on laisse passer vers la route
  } catch (error) {
    console.error("protect :", error.message);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
