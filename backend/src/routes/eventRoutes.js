
import { Router } from "express";
import {
  createEvent,
  getEvents
} from "../controllers/eventControllers.js";
import auth from "../middleware/auth.js";

const router = Router();

// Récupérer tous les événements
router.get("/", getEvents);

// Créer un événement (connexion obligatoire)
router.post("/", auth, createEvent);

export default router;
