// src/routes/auth.js
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/ConAuth"); // Mengimpor controller

// Halaman login
router.get("/login", AuthController.loginPage);

// Proses login
router.post("/login", AuthController.loginProcess);

// Halaman logout
router.get("/logout", AuthController.logout);

// Halaman register
router.get("/daftar", AuthController.registerPage);

// Proses register
router.post("/daftar", AuthController.registerProcess);

// Verifikasi email dengan api-key
router.get("/verify", AuthController.verifyEmail);


module.exports = router;
