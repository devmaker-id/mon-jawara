const express = require("express");
const router = express.Router();
const InboxController = require("../controllers/InboxController");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/", ensureAuthenticated, InboxController.index);
router.get("/chat/:id", ensureAuthenticated, InboxController.chat);
router.get("/chat/:id/json", ensureAuthenticated, InboxController.chatJSON);
router.post("/send", ensureAuthenticated, InboxController.send);

module.exports = router;
