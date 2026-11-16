import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  me,
  verifyEmail,
  resendCode,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = Router();

// Limites par adresse IP pour bloquer les robots (essais de mots de passe ou de codes en masse)
const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Trop de tentatives, réessaie dans quelques minutes." },
});

const limiteEnvoiEmail = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Trop d'emails demandés, réessaie plus tard." },
});

router.post("/register", limiteEnvoiEmail, register); // inscription + envoi du code
router.post("/verify-email", limiteAuth, verifyEmail); // saisie du code reçu par email
router.post("/resend-code", limiteEnvoiEmail, resendCode); // renvoyer un code
router.post("/login", limiteAuth, login); // connexion
router.post("/forgot-password", limiteEnvoiEmail, forgotPassword); // mot de passe oublié : envoi du code
router.post("/reset-password", limiteAuth, resetPassword); // code + nouveau mot de passe
router.get("/me", protect, me); // infos du user connecté

export default router;
