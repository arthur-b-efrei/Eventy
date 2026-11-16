import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

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
