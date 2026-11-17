import mongoose from "mongoose";

// La photo de profil d'un user, rangée à part pour ne pas alourdir chaque lecture du user.
// L'image est déjà réduite à 256 × 256 par le navigateur : elle pèse environ 20 à 40 Ko.
const photoProfilSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // une seule photo par user
    },
    type: { type: String, enum: ["image/jpeg", "image/png", "image/webp"], required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PhotoProfil", photoProfilSchema);
