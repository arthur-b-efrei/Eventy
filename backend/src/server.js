import "dotenv/config"; // charge les variables du fichier .env
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// On se connecte d'abord à la base, puis on démarre le serveur
await connectDB();

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
