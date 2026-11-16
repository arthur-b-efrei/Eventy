import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.post("/register", register); // inscription
router.post("/login", login); // connexion
router.get("/me", protect, me); // infos du user connecté

export default router;
