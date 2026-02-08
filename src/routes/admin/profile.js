const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConProfilePaket = require("../../controllers/ProfilePaketController");
// profile module pool
router.get("/group", ensureAuthenticated, ConProfilePaket.profileGroup);
router.post("/group/add", ensureAuthenticated, ConProfilePaket.profileGroupAdd);

// profile global
router.get("/hotspot", ensureAuthenticated, ConProfilePaket.profileHotspot);
router.get("/hotspot/:id", ensureAuthenticated, ConProfilePaket.getProfileHotspot);
router.post("/hotspot", ensureAuthenticated, ConProfilePaket.storeHotspot);
router.put("/hotspot/:id", ensureAuthenticated, ConProfilePaket.updateHotspot);
router.post("/hotspot/delete/:id", ensureAuthenticated, ConProfilePaket.destroyHotspot);
router.get("/pppoe", ensureAuthenticated, ConProfilePaket.profilePppoe);

module.exports = router;
