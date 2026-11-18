
import { Router } from "express";

// Tes fonctionnalités : création et récupération des événements
import {
  createEvent,
  getEvents,
} from "../controllers/eventControllers.js";

// Fonctionnalités de ton collègue : inscrits, modification et suppression
import {
  listerInscrits,
  modifierEvenement,
  supprimerEvenement,
} from "../controllers/reservationController.js";

// Middleware d'authentification JWT
import auth from "../middleware/auth.js";

const router = Router();

// Récupérer tous les événements
router.get("/", getEvents);

// Créer un événement (connexion obligatoire)
router.post("/", auth, createEvent);

// Liste des participants : créateur et inscrits (emails visibles par le créateur seulement)
router.get("/:id/inscrits", auth, listerInscrits);

// Modifier un événement : réservé au créateur
router.patch("/:id", auth, modifierEvenement);

// Supprimer un événement : réservé au créateur
router.delete("/:id", auth, supprimerEvenement);

export default router;
