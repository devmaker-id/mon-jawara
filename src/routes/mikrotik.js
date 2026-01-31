const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const ConMikrotik = require("../controllers/ConMikrotik");

router.get("/", ensureAuthenticated, ConMikrotik.index);
router.post("/gen-sc-vpn", ensureAuthenticated, ConMikrotik.generateScriptVpn);
router.post("/delete-script", ensureAuthenticated, ConMikrotik.deleteScriptVpn);
router.post("/ping-vpn-client", ensureAuthenticated, ConMikrotik.pingClientVpn);
router.post("/save-mikrotik", ensureAuthenticated, ConMikrotik.saveMikrotikVpn);
router.post("/info-aksess-publik", ensureAuthenticated, ConMikrotik.infoAksesPublic);

module.exports = router;
