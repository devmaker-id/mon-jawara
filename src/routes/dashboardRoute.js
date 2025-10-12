// src/routes/dashboardRoute.js
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const DashboardController = require("../controllers/DashboardController"); // Controller untuk halaman dashboard

// Admin dashboard
router.get('/admin', ensureAuthenticated, isAdmin, (req, res) => {
  res.render('dashboard/admin');
});

// Semua user (free, reguler, vip, admin)
router.get("/", ensureAuthenticated, DashboardController.dashboardPage);

module.exports = router;
