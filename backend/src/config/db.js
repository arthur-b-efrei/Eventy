import mongoose from "mongoose";

// Connexion à MongoDB avec le lien écrit dans le fichier .env
export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error.message);
    process.exit(1); // on arrête le serveur, il ne sert à rien sans base
  }
}
