import { Router } from "express";
import { createEvent } from "../controllers/eventController.js";
import auth from "../middleware/auth.js"; // à confirmer avec ta camarade

const router = Router();

// Seul un utilisateur connecté peut créer un événement
router.post("/", auth, createEvent);

export default router;