const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");
const NotificationController = require("../controllers/admin/NotificationController");

router.get("/", NotificationController.userIndex);
router.post("/read/:id", NotificationController.markRead);

module.exports = router;
