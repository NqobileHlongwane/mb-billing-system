import express from 'express'
import { createClient , getClients } from '../controllers/clientController.js'

const router = express.Router()

router.get('/clients', getClients )

router.post("/clients", (req, res, next) => {
  const { name, email, phone } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Client name is required",
    });
  }

   next();
}, createClient);



export default router
