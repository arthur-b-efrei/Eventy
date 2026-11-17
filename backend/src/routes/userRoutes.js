import { Router } from "express";
import { envoyerPhoto, supprimerPhoto, lirePhoto } from "../controllers/userController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.put("/me/avatar", protect, envoyerPhoto); // envoyer / changer sa photo
router.delete("/me/avatar", protect, supprimerPhoto); // revenir à l'emoji
router.get("/:id/avatar", lirePhoto); // afficher la photo d'un user

export default router;
