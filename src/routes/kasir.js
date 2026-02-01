const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isKasir } = require("../middleware/auth");
const KasirController = require("../controllers/KasirController");

router.use(ensureAuthenticated, isKasir);

// route utama kasir
router.get("/", KasirController.index);
router.post("/tambah-penjualan", ensureAuthenticated, KasirController.simpanPenjualan);
router.get("/data-penjualan", ensureAuthenticated, KasirController.dataPenjualan);
router.get("/transaksi-detail/:id", ensureAuthenticated, KasirController.detailTransaksi);

module.exports = router;