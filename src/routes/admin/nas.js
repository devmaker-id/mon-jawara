const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConNas = require("../../controllers/admin/NasController");

router.get("/", ensureAuthenticated, ConNas.index);
router.get("/new", ensureAuthenticated, ConNas.newNas);
router.get("/new-use-vpn", ensureAuthenticated, ConNas.newNasUseVpn);
router.post("/buat-radius", ensureAuthenticated, ConNas.buatRadiusClient);
router.delete("/:id", ensureAuthenticated, ConNas.deleteNas);

module.exports = router;
