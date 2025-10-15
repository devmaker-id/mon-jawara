const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConOdp = require("../../controllers/admin/OdpPopController");

router.get("/", ensureAuthenticated, ConOdp.index);
router.get("/new", ensureAuthenticated, ConOdp.addNew);
router.get("/view-onu/:id", ensureAuthenticated, ConOdp.viewOnu);
router.post("/edit/:id", ensureAuthenticated, ConOdp.updateOdpPop);
router.post("/tambah", ensureAuthenticated, ConOdp.tambahOdp);
router.delete("/:id", ensureAuthenticated, ConOdp.deleteOdp);

module.exports = router;
