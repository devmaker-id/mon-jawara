const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const ensureWhatsapp = require("../middleware/ensureWhatsapp");
const waCon = require("../controllers/WhatsappController");

router.get("/", ensureAuthenticated, waCon.index);
router.get("/qr", ensureAuthenticated, waCon.qrPage);
router.get("/qr/data", ensureAuthenticated, waCon.qrData);
router.get("/status", ensureAuthenticated, waCon.status);
router.post("/send", ensureAuthenticated, waCon.send);
router.post("/logout", ensureAuthenticated, waCon.logout);
router.post("/init", ensureAuthenticated, waCon.init);

router.get("/kontak", ensureAuthenticated, waCon.kontak);
router.post("/kontak/tambah", ensureAuthenticated, waCon.tambahKontak);
router.post("/kontak/edit", ensureAuthenticated, waCon.editKontak);
router.get("/kontak/hapus/:id", ensureAuthenticated, waCon.hapusKontak);
router.get("/kontak/sendMessage/:id", ensureAuthenticated, waCon.tesKirimPesan);

module.exports = router;
