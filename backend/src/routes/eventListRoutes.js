import { Router } from "express";
import { listEvents } from "../controllers/eventListController.js";

const router = Router();

router.get("/", listEvents); // liste de tous les événements

export default router;
