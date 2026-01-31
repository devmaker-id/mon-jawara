const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const ConUser = require("../controllers/UserController");

router.get("/profile", ConUser.index);
router.post("/profile", ConUser.update);

module.exports = router;
