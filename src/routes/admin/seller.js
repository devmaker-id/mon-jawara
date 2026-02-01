const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../middleware/auth");
const Seller = require("../../controllers/admin/SellerController");
const AccessSeller = require("../../controllers/seller/seller.access");

router.get("/", ensureAuthenticated, Seller.index);
router.get("/add-new", ensureAuthenticated, Seller.tambahBaru);
router.post("/add-new", ensureAuthenticated, Seller.simpanSeller);
router.get("/products", ensureAuthenticated, Seller.sellerProduct);
router.get("/add-product", ensureAuthenticated, Seller.addSellerProduct);
router.post("/add-product", ensureAuthenticated, Seller.prosessAddSellerProduct);

router.get("/aksess-free", ensureAuthenticated, AccessSeller.index);
router.get("/access/available-sellers", ensureAuthenticated, AccessSeller.getAvailableSellers);
router.get("/access/available-onu", ensureAuthenticated, AccessSeller.onuAvailabel);
router.post("/access/create", ensureAuthenticated, AccessSeller.create);
router.put("/access/:id", ensureAuthenticated, AccessSeller.updateAccess);
router.delete('/access/delete/:id', ensureAuthenticated, AccessSeller.delete);


module.exports = router;
