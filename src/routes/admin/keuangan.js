const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConKeuangan = require("../../controllers/admin/KeuanganController");

router.get("/", ensureAuthenticated, ConKeuangan.index);
router.get("/pengeluaran", ensureAuthenticated, ConKeuangan.pengeluaran);
router.get("/hutangpiutang", ensureAuthenticated, ConKeuangan.piutang);

module.exports = router;
