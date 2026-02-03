const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConNas = require("../../controllers/admin/NasController");

router.get("/", ensureAuthenticated, ConNas.index);
router.post("/buat-radius", ensureAuthenticated, ConNas.buatRadiusClient);
router.delete("/:id", ensureAuthenticated, ConNas.deleteNas);

module.exports = router;
