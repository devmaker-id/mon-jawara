const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { ensureAuthenticated } = require("../../middleware/auth");
const Product = require("../../controllers/admin/ProductController");

// Buat folder upload jika belum ada
const uploadDir = path.join(__dirname, "../../../uploads/product");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const randomName = crypto.randomBytes(6).toString('hex'); // nama random
    cb(null, `${randomName}-${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("File harus berupa gambar"), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // max 2MB
});

router.get("/", ensureAuthenticated, Product.index);
router.post("/add-new", upload.single("gambar"), ensureAuthenticated, Product.saveNewProduct);
router.post("/edit", upload.single("gambar"), ensureAuthenticated, Product.updateProduct);

module.exports = router;
