const express = require("express");
const router = express.Router();
const multer = require("multer");

// middleware auth
const { ensureAuthenticated, isAdmin } = require("../../middleware/auth");

// upload global
const upload = multer({ dest: "uploads/" });
// khusus upload bukti PLN
const uploadBukti = multer({ dest: "uploads/bukti_pln/" });

// import sub-routes
const adminRoute = require("./admin");        // pengaturan admin & api telegram
const oltRoute = require("./olt");
const odpRoute = require("./odp");
const onuRoute = require("./onu");
const vpnRoute = require("./vpn");
const vpsRoute = require("./vps");
const mikrotikRoute = require("./mikrotik");
const radiusRoute = require("./radius");
const nasRoute = require("./nas");
const banwithRoute = require("./banwith");
const profileRoute = require("./profile");
const pelangganRoute = require("./pelanggan");
const sellerRoute = require("./seller");
const productRoute = require("./product");
const kartuVcrRoute = require("./kartu_vcr");
const keuanganRoute = require("./keuangan");
const closingRoute = require("./closing");
const plnRoute = require("./pln");
const notifRoute = require("./notificationRoutes");

// semua route admin butuh isAdmin
router.use(isAdmin);

// prefix route masing-masing modul
router.use("/admin-setting", adminRoute);
router.use("/olt", oltRoute);
router.use("/odp-pop", odpRoute);
router.use("/router-onu", onuRoute);
router.use("/vpn-server", vpnRoute);
router.use("/vps-server", vpsRoute);
router.use("/radius-server", radiusRoute);
router.use("/mikrotik-client", mikrotikRoute);
router.use("/nas-client", nasRoute);
router.use("/banwith-management", banwithRoute);
router.use("/profile", profileRoute);
router.use("/user-hotspot", pelangganRoute);
router.use("/seller", sellerRoute);
router.use("/product", productRoute);
router.use("/kartu-voucher", kartuVcrRoute);
router.use("/keuangan", keuanganRoute);
router.use("/closingan", closingRoute);
router.use("/mgmn-pln", plnRoute);
router.use("/notif", notifRoute);

module.exports = router;
