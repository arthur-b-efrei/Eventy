import mongoose from "mongoose";

// Un code à 6 chiffres envoyé par email pour vérifier l'adresse d'un user.
// Le code n'est jamais stocké en clair : seulement sa version cryptée (bcrypt).
const codeVerificationSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code_hash: { type: String, required: true },
    // Nombre de mauvais essais (bloqué après 5)
    tentatives: { type: Number, default: 0 },
    // MongoDB supprime tout seul le document à cette date (index TTL)
    expire_le: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    // createdAt sert à empêcher de renvoyer un code toutes les secondes
    timestamps: true,
  }
);

export default mongoose.model("CodeVerification", codeVerificationSchema);
