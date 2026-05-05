import express from 'express'
import { createMatter, getMatters } from '../controllers/matterController.js'

const router = express.Router()

// CREATE MATTER
router.post("/matters", (req, res, next) => {
  const { client_id, title } = req.body;

  if (!client_id || !title) {
    return res.status(400).json({
      error: "client_id and title are required",
    });
  }

  next();
}, createMatter);

// GET MATTERS
router.get("/matters", getMatters);

export default router;