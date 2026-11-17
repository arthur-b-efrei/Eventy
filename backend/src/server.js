import "dotenv/config"; // charge les variables du fichier .env
import { createServer } from "node:http";
import app from "./app.js";
import { demarrerSocket } from "./socket.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// On se connecte d'abord à la base, puis on démarre le serveur
await connectDB();

// Express et le WebSocket de la discussion partagent le même serveur (et donc le même port)
const serveur = createServer(app);
demarrerSocket(serveur);

serveur.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  // Dit tout de suite si les emails partent vraiment ou s'ils s'affichent seulement ici
  console.log(
    process.env.BREVO_API_KEY
      ? `Emails : envoi réel via Brevo (expéditeur ${process.env.MAIL_FROM_EMAIL})`
      : "Emails : mode dev, pas d'envoi réel (les codes s'affichent dans ce terminal)"
  );
});
