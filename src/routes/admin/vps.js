const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConVpsServer = require("../../controllers/admin/VpsController");

router.get("/", ensureAuthenticated, ConVpsServer.index);

module.exports = router;
