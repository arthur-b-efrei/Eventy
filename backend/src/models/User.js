import mongoose from "mongoose";

// Un utilisateur de l'appli.
// L'ID (_id) est créé automatiquement par MongoDB.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // deux comptes ne peuvent pas avoir le même email
      lowercase: true,
      trim: true,
    },
    // Mot de passe crypté avec bcrypt (jamais en clair)
    password: { type: String, required: true },
    date_naissance: { type: Date, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    // Ajoute createdAt (date de création) et updatedAt tout seul
    timestamps: true,
  }
);

// Quand on renvoie un user au front, on retire le mot de passe
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
