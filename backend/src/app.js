
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import eventListRoutes from "./routes/eventListRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";

const app = express();

// Autoriser les requêtes du frontend
app.use(cors());

// Lire les données JSON (1 Mo : laisse passer une image d'événement compressée en data URL)
app.use(express.json({ limit: "1mb" }));

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

// Discussion de groupe d'un événement (historique ; le direct passe par le WebSocket, voir socket.js)
app.use("/api/events", discussionRoutes);

export default app;
