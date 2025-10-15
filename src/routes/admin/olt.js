const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const ConOlt = require("../../controllers/admin/OltController");

// Brand
router.get("/type", ensureAuthenticated, ConOlt.oltBrand);
router.post("/brand/add", ensureAuthenticated, ConOlt.addNewBrand);
router.post("/brand/edit/:id", ensureAuthenticated, ConOlt.editBrand);

// OLT Data
router.get("/", ensureAuthenticated, ConOlt.index);
router.get("/tambah", ensureAuthenticated, ConOlt.tambahBaru);
router.get("/:id", ensureAuthenticated, ConOlt.getById);
router.post("/add", ensureAuthenticated, ConOlt.addNewOlt);
router.post("/edit/:id", ensureAuthenticated, ConOlt.editOlt);
router.post("/delete/:id", ensureAuthenticated, ConOlt.deleteOlt);

module.exports = router;
