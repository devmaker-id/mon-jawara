const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");

// Controller Mikrotik (contoh sederhana)
const ConMikrotik = require("../../controllers/admin/MikrotikController");

// Halaman index Mikrotik
router.get("/", ensureAuthenticated, ConMikrotik.index);

module.exports = router;
