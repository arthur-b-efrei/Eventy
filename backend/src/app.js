import express from "express";
import cors from "cors";
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

// Routes des événements
app.use("/api/events", eventRoutes);

export default app;