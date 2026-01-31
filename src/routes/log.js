const express = require("express");
const router = express.Router();
const { validServerToServer } = require("../middleware/apiKey");
const LogController = require("../controllers/LogController");

router.post("/jawara", validServerToServer, LogController.receiveLog);

module.exports = router;
