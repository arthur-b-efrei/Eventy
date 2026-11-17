import { Router } from "express";
import rateLimit from "express-rate-limit";
import { envoyerPhoto, supprimerPhoto, lirePhoto } from "../controllers/userController.js";
import { modifierInfos, changerMotDePasse, supprimerCompte } from "../controllers/profilController.js";
import protect from "../middleware/auth.js";

const router = Router();

// Les routes qui demandent le mot de passe actuel sont limitées (anti essais en rafale)
const limiteMotDePasse = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Trop de tentatives, réessaie dans quelques minutes." },
});

router.patch("/me", protect, modifierInfos); // changer prénom / date de naissance
router.put("/me/password", protect, limiteMotDePasse, changerMotDePasse); // changer de mot de passe
router.delete("/me", protect, limiteMotDePasse, supprimerCompte); // supprimer son compte

router.put("/me/avatar", protect, envoyerPhoto); // envoyer / changer sa photo
router.delete("/me/avatar", protect, supprimerPhoto); // revenir à l'emoji
router.get("/:id/avatar", lirePhoto); // afficher la photo d'un user

export default router;
