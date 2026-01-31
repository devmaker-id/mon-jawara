const express = require("express");
const router = express.Router();
const Webhook = require("../controllers/WebhookController");

router.post("/:salt", Webhook.handlerBot);


module.exports = router;
