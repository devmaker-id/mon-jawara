const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConAdmin = require("../../controllers/admin/AdminController");

// Admin setting
router.get("/setting-general", ensureAuthenticated, ConAdmin.index);
router.get("/role-manajement", ensureAuthenticated, ConAdmin.rolemgmn);
router.get("/users", ensureAuthenticated, ConAdmin.mgmnUsers);

// API Telegram
router.get("/api-telegram", ensureAuthenticated, ConAdmin.apiTelegram);

module.exports = router;
