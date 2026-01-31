const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const ConTelegram = require("../controllers/ConTelegram");

router.get("/", ensureAuthenticated, ConTelegram.index);
router.post("/add-token", ensureAuthenticated, ConTelegram.addTokenTelegram);
router.post("/delete-telegran", ensureAuthenticated, ConTelegram.deleteTelegram);
router.post("/set-webhook", ensureAuthenticated, ConTelegram.setWebhookTelegram);
router.post("/add-owner-id", ensureAuthenticated, ConTelegram.addOwnerTeleId);

module.exports = router;
