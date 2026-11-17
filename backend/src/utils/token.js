import jwt from "jsonwebtoken";

// Crée un token JWT qui contient l'id et le rôle du user (valable 7 jours)
export function creerToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
