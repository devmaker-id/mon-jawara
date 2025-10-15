const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConPelanggan = require("../../controllers/PelangganController");

router.get("/", ensureAuthenticated, ConPelanggan.userHotspot);
router.post("/", ensureAuthenticated, ConPelanggan.addUserHotspot);
router.delete("/:id", ensureAuthenticated, ConPelanggan.deleteUserHotspot);
router.get("/pppoe", ensureAuthenticated, ConPelanggan.userPppoe);

module.exports = router;
