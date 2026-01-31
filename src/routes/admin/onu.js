const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConOnu = require("../../controllers/admin/OnuController");

router.get("/", ensureAuthenticated, ConOnu.index);
router.get("/view/:id", ensureAuthenticated, ConOnu.detailOnu);
router.get("/add-new", ensureAuthenticated, ConOnu.addNew);
router.post("/add-new", ensureAuthenticated, ConOnu.prosessTambahOnu);
router.post("/edit/:id", ensureAuthenticated, ConOnu.editOnu);
router.delete("/delete/:id", ensureAuthenticated, ConOnu.deleteOnu);

module.exports = router;
