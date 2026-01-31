const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const NotificationController = require("../../controllers/admin/NotificationController");

router.get("/", NotificationController.index);
router.post("/create", NotificationController.create);
router.get("/delete/:id", NotificationController.delete);

module.exports = router;
