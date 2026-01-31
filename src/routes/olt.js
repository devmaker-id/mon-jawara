const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const ConOlt = require("../controllers/ConOlt");

router.get("/", ensureAuthenticated, ConOlt.index);
router.get("/settings/:userid/:oltid", ensureAuthenticated, ConOlt.settings);

router.post("/join-to-server", ensureAuthenticated, ConOlt.joinOltToServer);
router.post("/tambaholt", ensureAuthenticated, ConOlt.tambahBaru);
router.post("/hapusolt", ensureAuthenticated, ConOlt.hapusOlt);

module.exports = router;
