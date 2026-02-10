const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConNas = require("../../controllers/admin/NasController");
//menu manajement nas
router.get("/", ensureAuthenticated, ConNas.index);
router.get("/station", ensureAuthenticated, ConNas.nasStation);
router.get("/domain", ensureAuthenticated, ConNas.nasDomain);

router.get("/mikrotik/:id", ensureAuthenticated, ConNas.getHostMikrotik);
router.post("/buat-radius", ensureAuthenticated, ConNas.buatRadiusClient);
router.put("/change/:id", ensureAuthenticated, ConNas.editNas);
router.delete("/delete/:id", ensureAuthenticated, ConNas.deleteNas);

module.exports = router;
