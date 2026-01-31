const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConBanwith = require("../../controllers/BanwithController");

router.get("/", ensureAuthenticated, ConBanwith.index);
router.post("/store", ensureAuthenticated, ConBanwith.store);
router.post("/update", ensureAuthenticated, ConBanwith.update);
router.post("/delete", ensureAuthenticated, ConBanwith.destroy);

module.exports = router;
