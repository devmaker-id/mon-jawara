const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");

// Controller Mikrotik (contoh sederhana)
const ConMikrotik = require("../../controllers/admin/MikrotikController");

// Halaman index Mikrotik
// Halaman index
router.get("/", ensureAuthenticated, ConMikrotik.index);

// Ambil data Mikrotik by ID (AJAX)
router.get("/:id", ensureAuthenticated, ConMikrotik.getById);

// Tambah Mikrotik (AJAX)
router.post("/add", ensureAuthenticated, ConMikrotik.add);

// Edit Mikrotik (AJAX)
router.post("/edit/:id", ensureAuthenticated, ConMikrotik.edit);

// Delete Mikrotik (AJAX)
router.post("/delete/:id", ensureAuthenticated, ConMikrotik.delete);


module.exports = router;
