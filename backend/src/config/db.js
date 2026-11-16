import dns from "node:dns";
import mongoose from "mongoose";

// Connexion à MongoDB avec le lien écrit dans le fichier .env
export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté");
  } catch (error) {
    // Le lien "mongodb+srv://" demande une recherche DNS spéciale (SRV).
    // Certains réseaux (partage de connexion d'un téléphone, box) la refusent :
    // dans ce cas on réessaie une fois avec les DNS publics de Cloudflare et Google.
    if (error.message.includes("querySrv")) {
      console.warn("Le DNS du réseau bloque la recherche MongoDB, nouvel essai avec 1.1.1.1 / 8.8.8.8…");
      try {
        dns.setServers(["1.1.1.1", "8.8.8.8"]);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connecté (via DNS publics)");
        return;
      } catch (secondeErreur) {
        error = secondeErreur;
      }
    }

    console.error("Erreur de connexion à MongoDB :", error.message);
    process.exit(1); // on arrête le serveur, il ne sert à rien sans base
  }
}
