const express = require("express");
const router = express.Router();
const multer = require("multer");
const { ensureAuthenticated } = require("../../middleware/auth");
const ConPlnRoute = require("../../controllers/PlnController");

const uploadBukti = multer({ dest: "uploads/bukti_pln/" });

// Data PLN
router.get("/", ensureAuthenticated, ConPlnRoute.index);
router.get("/create", ensureAuthenticated, ConPlnRoute.createForm);
router.post("/store", ensureAuthenticated, ConPlnRoute.store);
router.get("/edit/:id", ensureAuthenticated, ConPlnRoute.editForm);
router.post("/update/:id", ensureAuthenticated, ConPlnRoute.update);
router.post("/delete/:id", ensureAuthenticated, ConPlnRoute.destroy);

// Transaksi PLN
router.get("/transaksi", ensureAuthenticated, ConPlnRoute.transaksi);
router.post("/transaksi/store", ensureAuthenticated, ConPlnRoute.transaksiStore);

// Upload bukti
router.get("/upload-bukti", ensureAuthenticated, ConPlnRoute.uploadForm);
router.post("/upload-bukti", ensureAuthenticated, uploadBukti.single("bukti"), ConPlnRoute.uploadBukti);

// Riwayat / Struk
router.get("/riwayat", ensureAuthenticated, ConPlnRoute.riwayat);

module.exports = router;
