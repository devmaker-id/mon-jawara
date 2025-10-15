const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConVpnServer = require("../../controllers/admin/VpnServerController");

router.get("/", ensureAuthenticated, ConVpnServer.index);
router.get("/type", ensureAuthenticated, ConVpnServer.vpntype);
router.get("/group", ensureAuthenticated, ConVpnServer.vpngroup);
router.get("/routing", ensureAuthenticated, ConVpnServer.vpnRouting);
router.get("/firewall", ensureAuthenticated, ConVpnServer.vpnFirewall);
router.get("/all-account", ensureAuthenticated, ConVpnServer.allAccountVpn);
router.post("/add-account", ensureAuthenticated, ConVpnServer.addAccount);
router.post("/update-account", ensureAuthenticated, ConVpnServer.updateAccount);
router.delete("/delete-account/:id", ensureAuthenticated, ConVpnServer.deleteAccount);
router.get("/limit-akun", ensureAuthenticated, ConVpnServer.vpnLimit);
router.post("/update-limit-akun", ensureAuthenticated, ConVpnServer.updateLimitAkun);
router.post("/add-limit-akun", ensureAuthenticated, ConVpnServer.addLimitAkun);
router.delete("/delete-limit-akun/:id", ensureAuthenticated, ConVpnServer.deleteLimitAkun);


module.exports = router;
