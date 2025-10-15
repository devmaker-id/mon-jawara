const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConVpnServer = require("../../controllers/admin/VpnServerController");

router.get("/", ensureAuthenticated, ConVpnServer.index);
router.get("/type", ensureAuthenticated, ConVpnServer.vpntype);
router.get("/group", ensureAuthenticated, ConVpnServer.vpngroup);
router.get("/routing", ensureAuthenticated, ConVpnServer.vpnRouting);
router.get("/firewall", ensureAuthenticated, ConVpnServer.vpnFirewall);
router.get("/limit-akun", ensureAuthenticated, ConVpnServer.vpnLimit);
router.post("/update-limit-akun", ensureAuthenticated, ConVpnServer.updateLimitAkun);

module.exports = router;
