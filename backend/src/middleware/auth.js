import jwt from "jsonwebtoken";

// À mettre devant les routes réservées aux users connectés.
// Le front doit envoyer l'en-tête : Authorization: Bearer <token>
export default function protect(req, res, next) {
  const entete = req.headers.authorization || "";

  if (!entete.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non connecté" });
  }

  const token = entete.split(" ")[1];

  try {
    // Vérifie que le token a bien été signé par nous et qu'il n'a pas expiré
    const contenu = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: contenu.id, role: contenu.role };
    next(); // on laisse passer vers la route
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
