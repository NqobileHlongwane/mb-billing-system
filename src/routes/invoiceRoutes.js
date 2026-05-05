import express from "express";
import {
  generateInvoice,
  getInvoiceById,
  downloadInvoice,
  getInvoices,
} from "../controllers/invoiceController.js";

const router = express.Router();

// ============================
// GENERATE INVOICE
// ============================
router.post(
  "/invoices/generate",
  (req, res, next) => {
    const { client_id } = req.body;

    if (!client_id) {
      return res.status(400).json({
        error: "client_id is required",
      });
    }

    next();
  },
  generateInvoice
);

// ============================
// GET ALL INVOICES
// ============================
router.get("/invoices", getInvoices);

// ============================
// GET SINGLE INVOICE
// ============================
router.get("/invoices/:id", getInvoiceById);

// ============================
// DOWNLOAD PDF
// ============================
router.get("/invoices/:id/download", downloadInvoice);

export default router;