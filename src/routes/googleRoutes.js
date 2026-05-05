import express from "express";
import {
  connectGoogle,
  googleCallback,
  syncCalendar,
} from "../controllers/googleController.js";

const router = express.Router();

router.get("/auth/google", connectGoogle);
router.get("/auth/google/callback", googleCallback);
router.get("/calendar/sync", syncCalendar);

export default router;