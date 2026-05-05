import express from "express";
import {
  createTimeEntry,
  getTimeEntries,
} from "../controllers/timeController.js";

const router = express.Router();

// CREATE TIME ENTRY (with validation)
router.post("/time-entries", (req, res, next) => {
  const { matter_id, start_time, end_time } = req.body;

  if (!matter_id || !start_time || !end_time) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  // prevent invalid time
  if (new Date(end_time) <= new Date(start_time)) {
    return res.status(400).json({
      error: "End time must be after start time",
    });
  }

  next();
}, createTimeEntry);


// GET TIME ENTRIES
router.get("/time-entries", getTimeEntries);

export default router;