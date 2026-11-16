import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// En production, l'appli tourne derrière le proxy de l'hébergeur :
// sans ça, toutes les requêtes auraient la même IP et la limite anti-robots bloquerait tout le monde.
app.set("trust proxy", 1);

// Autorise le front (Vite) à appeler l'API
app.use(cors());
// Permet de lire le JSON envoyé dans le corps des requêtes
app.use(express.json());

// Route de test : http://localhost:5000/api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Inscription / connexion
app.use("/api/auth", authRoutes);

// Les autres routes (events, réservations, profil) seront branchées ici.

export default app;
