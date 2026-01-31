const express = require("express");
const router = express.Router();
const multer = require("multer");
const { ensureAuthenticated } = require("../../middleware/auth");
const Product = require("../../controllers/admin/ProductController");

const upload = multer({ dest: "uploads/" });

router.get("/", ensureAuthenticated, Product.index);
router.get("/add-new", ensureAuthenticated, Product.addNewProduct);
router.post("/add-new", upload.single("gambar"), ensureAuthenticated, Product.saveNewProduct);

module.exports = router;
