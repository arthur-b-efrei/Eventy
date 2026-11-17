
import { Router } from "express";

// Tes fonctionnalités : création et récupération des événements
import {
  createEvent,
  getEvents,
} from "../controllers/eventControllers.js";

// Fonctionnalités de ton collègue : inscrits et modification
import {
  listerInscrits,
  modifierEvenement,
} from "../controllers/reservationController.js";

// Middleware d'authentification JWT
import auth from "../middleware/auth.js";

const router = Router();

// Récupérer tous les événements
router.get("/", getEvents);

// Créer un événement (connexion obligatoire)
router.post("/", auth, createEvent);

// Liste des inscrits : réservée au créateur de l'événement
router.get("/:id/inscrits", auth, listerInscrits);

// Modifier un événement : réservé au créateur
router.patch("/:id", auth, modifierEvenement);

export default router;
