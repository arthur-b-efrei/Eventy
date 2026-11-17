import { Router } from "express";
import protect from "../middleware/auth.js";
import {
  listerMesReservations,
  modifierReservation,
  annulerReservation,
} from "../controllers/reservationController.js";

const router = Router();

router.use(protect);
router.get("/", listerMesReservations);
router.patch("/:id", modifierReservation);
router.delete("/:id", annulerReservation);

export default router;
