const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConRadiusServer = require("../../controllers/admin/RadiusServerController");

router.get("/", ensureAuthenticated, ConRadiusServer.index);

// CRUD
router.post("/store", ensureAuthenticated, ConRadiusServer.store);
router.post("/update", ensureAuthenticated, ConRadiusServer.update);
router.post("/delete", ensureAuthenticated, ConRadiusServer.delete);

module.exports = router;