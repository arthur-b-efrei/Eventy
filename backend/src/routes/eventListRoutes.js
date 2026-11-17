import { Router } from "express";
import protect from "../middleware/auth.js";
import { listEvents } from "../controllers/eventListController.js";
import { inscrire } from "../controllers/inscriptionController.js";

const router = Router();

router.get("/", listEvents); // liste de tous les événements
router.post("/:id/inscription", protect, inscrire); // s'inscrire à un événement (connexion obligatoire)

export default router;
