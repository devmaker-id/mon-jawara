const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConCardVcr = require("../../controllers/KartuVcrController");

router.get("/", ensureAuthenticated, ConCardVcr.index);
router.get("/template", ensureAuthenticated, ConCardVcr.templateVcr);
router.post("/", ensureAuthenticated, ConCardVcr.generateBulkVouchers);
router.get("/cetak", ensureAuthenticated, ConCardVcr.cetakFiltered);
router.post("/template/add", ensureAuthenticated, ConCardVcr.addTemplate);
router.get("/preview/:id", ensureAuthenticated, ConCardVcr.previewTpl);
router.put("/template/update/:id", ensureAuthenticated, ConCardVcr.updateTemplate);
router.delete("/template/delete/:id", ensureAuthenticated, ConCardVcr.deleteTemplate);

module.exports = router;
