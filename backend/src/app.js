import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

// En production, l'appli tourne derrière le proxy de l'hébergeur :
// sans ça, toutes les requêtes auraient la même IP et la limite anti-robots bloquerait tout le monde.
app.set("trust proxy", 1);

// Autorise le front (Vite) à appeler l'API
app.use(cors());
// Permet de lire le JSON envoyé dans le corps des requêtes
// (1 Mo max : assez pour une photo de profil déjà réduite par le navigateur)
app.use(express.json({ limit: "1mb" }));

// Route de test : http://localhost:5000/api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Inscription / connexion
app.use("/api/auth", authRoutes);

// Profil des users (photo de profil)
app.use("/api/users", userRoutes);

// Réservations du user connecté
app.use("/api/reservations", reservationRoutes);

// Events (inscrits pour le créateur)
app.use("/api/events", eventRoutes);

export default app;
