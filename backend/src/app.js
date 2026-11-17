
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import eventListRoutes from "./routes/eventListRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

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

// Réservations de l'utilisateur connecté
app.use("/api/reservations", reservationRoutes);

// Liste des événements pour la page d'accueil
// À placer avant les routes dynamiques comme /:id
app.use("/api/events", eventListRoutes);

// Création et gestion des événements
app.use("/api/events", eventRoutes);

export default app;
