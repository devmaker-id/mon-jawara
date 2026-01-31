const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const ConVpn = require("../controllers/ConVpn");

router.get("/", ensureAuthenticated, ConVpn.index);
router.get("/:id/vpn-types", ensureAuthenticated, ConVpn.getType);
router.post("/create-akun", ensureAuthenticated, ConVpn.createVpn);
router.post("/delete/:id", ensureAuthenticated, ConVpn.deleteAkun);

module.exports = router;
