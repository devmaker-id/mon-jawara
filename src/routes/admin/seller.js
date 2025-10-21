const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const Seller = require("../../controllers/admin/SellerController");

router.get("/", ensureAuthenticated, Seller.index);
router.get("/add-new", ensureAuthenticated, Seller.tambahBaru);
router.post("/add-new", ensureAuthenticated, Seller.simpanSeller);
router.get("/products", ensureAuthenticated, Seller.sellerProduct);
router.get("/add-product", ensureAuthenticated, Seller.addSellerProduct);
router.post("/add-product", ensureAuthenticated, Seller.prosessAddSellerProduct);

router.get("/aksess-free", ensureAuthenticated, Seller.aksessKhusus);

module.exports = router;
