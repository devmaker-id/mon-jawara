// src/routes/apiRoute.js
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const apiVcr = require("../controllers/api/apiVoucherController");

router.get("/voucherHotspot", ensureAuthenticated, apiVcr.vcrHotspot);


module.exports = router;