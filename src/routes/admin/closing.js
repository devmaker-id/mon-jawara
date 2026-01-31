const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConClosing = require("../../controllers/admin/ClosingController");

router.get("/", ensureAuthenticated, ConClosing.index);

module.exports = router;
