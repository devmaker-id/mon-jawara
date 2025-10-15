const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConRadiusServer = require("../../controllers/admin/RadiusServerController");

router.get("/", ensureAuthenticated, ConRadiusServer.index);

module.exports = router;
