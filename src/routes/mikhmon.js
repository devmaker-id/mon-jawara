const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const MikhmonController = require("../controllers/MikhmonController");

router.get("/", ensureAuthenticated, MikhmonController.index);
router.post("/create", ensureAuthenticated, MikhmonController.createDomain);
router.post("/check-domain", ensureAuthenticated, MikhmonController.checkDomain);
router.post("/delete", ensureAuthenticated, MikhmonController.deleteDomain);

module.exports = router;
