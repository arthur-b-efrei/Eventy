import { Router } from "express";
import protect from "../middleware/auth.js";
import { listerMessages } from "../controllers/discussionController.js";

const router = Router();

// Historique de la discussion d'un event (créateur et inscrits uniquement)
router.get("/:id/messages", protect, listerMessages);

export default router;
