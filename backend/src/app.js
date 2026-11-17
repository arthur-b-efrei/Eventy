import express from "express";
import cors from "cors";

import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Autoriser les requêtes du frontend
app.use(cors());

// Lire les données JSON
app.use(express.json());

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Authentification
app.use("/api/auth", authRoutes);

// Profil utilisateur
app.use("/api/users", userRoutes);

// Création et gestion des événements
app.use("/api/events", eventRoutes);

export default app;