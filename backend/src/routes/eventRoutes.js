import { Router } from "express";
import protect from "../middleware/auth.js";
import {
  listerInscrits,
  modifierEvenement,
} from "../controllers/reservationController.js";

const router = Router();

// Liste des inscrits : réservée au créateur de l'event
router.get("/:id/inscrits", protect, listerInscrits);

// Modifier date / description / places : créateur uniquement
router.patch("/:id", protect, modifierEvenement);

export default router;
