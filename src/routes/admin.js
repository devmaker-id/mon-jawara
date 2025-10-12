//routes ini khusus admin
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { ensureAuthenticated, isAdmin } = require('../middleware/auth');
const ConAdmin = require("../controllers/admin/AdminController");
const ConOlt = require("../controllers/admin/OltController");
const ConOdp = require("../controllers/admin/OdpPopController");
const ConOnu = require("../controllers/admin/OnuController");
const ConVpnServer = require("../controllers/admin/VpnServerController");
const ConVpsServer = require("../controllers/admin/VpsController");
const ConRadiusServer = require("../controllers/admin/RadiusServerController");
const ConNas = require("../controllers/admin/NasController");
const ConKeuangan = require("../controllers/admin/KeuanganController");
const Seller = require("../controllers/admin/SellerController");
const Product = require("../controllers/admin/ProductController");

const ConBanwith = require("../controllers/BanwithController");
const ConProfilePaket = require("../controllers/ProfilePaketController");
const ConPelanggan = require("../controllers/PelangganController");
const ConCardVcr = require("../controllers/KartuVcrController");

router.use(isAdmin);

//ROUTES PENGATURAN ADMIN
router.get("/setting-general", ensureAuthenticated, ConAdmin.index);
router.get("/role-manajement", ensureAuthenticated, ConAdmin.rolemgmn);
router.get("/users", ensureAuthenticated, ConAdmin.mgmnUsers);

//ROUTES API TELEGRAM
router.get("/api-telegram", ensureAuthenticated, ConAdmin.apiTelegram);

//ROUTES OLT
router.get("/olt", ensureAuthenticated, ConOlt.index);
router.get("/tambah-olt", ensureAuthenticated, ConOlt.tambahBaru);

//ODP POP
router.get("/odp-pop", ensureAuthenticated, ConOdp.index);
router.get("/new-odp-pop", ensureAuthenticated, ConOdp.addNew);
router.get("/odp-pop/view-onu/:id", ensureAuthenticated, ConOdp.viewOnu);
router.post("/odp-pop/edit/:id", ensureAuthenticated, ConOdp.updateOdpPop);
router.post("/odp-pop/tambah", ensureAuthenticated, ConOdp.tambahOdp);
router.delete("/odp-pop/:id", ensureAuthenticated, ConOdp.deleteOdp);


//ROUTER ONU
router.get("/router-onu", ensureAuthenticated, ConOnu.index);
router.get("/add-new-onu", ensureAuthenticated, ConOnu.addNew);
router.post("/add-new-onu", ensureAuthenticated, ConOnu.prosessTambahOnu);
router.post("/edit-onu/:id", ensureAuthenticated, ConOnu.editOnu);
router.delete("/onu/delete/:id", ensureAuthenticated, ConOnu.deleteOnu);

//ROUTER VPS SERVER
router.get("/vps-server", ensureAuthenticated, ConVpsServer.index);

//ROUTER VPN SERVER
router.get("/vpn-server", ensureAuthenticated, ConVpnServer.index);
router.get("/vpn-type", ensureAuthenticated, ConVpnServer.vpntype);
router.get("/vpn-group", ensureAuthenticated, ConVpnServer.vpngroup);
router.get("/vpn-routing", ensureAuthenticated, ConVpnServer.vpnRouting);
router.get("/vpn-firewall", ensureAuthenticated, ConVpnServer.vpnFirewall);
router.get("/limit-akun-vpn", ensureAuthenticated, ConVpnServer.vpnLimit);
router.post("/update-limit-akun", ensureAuthenticated, ConVpnServer.updateLimitAkun);

//ROUTER RADIUS SERVER
router.get("/radius-server", ensureAuthenticated, ConRadiusServer.index);

//ROUTER NAS CLIENT
router.get("/nas-client", ensureAuthenticated, ConNas.index);
router.get("/new-nas-client", ensureAuthenticated, ConNas.newNas);
router.get("/new-nas-use-vpn", ensureAuthenticated, ConNas.newNasUseVpn);
router.post("/buat-radius", ensureAuthenticated, ConNas.buatRadiusClient);
router.delete("/nas-client/:id", ensureAuthenticated, ConNas.deleteNas);

//ROUTER BANWITH
router.get("/banwith-management", ensureAuthenticated, ConBanwith.index);
router.post("/banwith/store", ensureAuthenticated, ConBanwith.store);
router.post("/banwith/update", ensureAuthenticated, ConBanwith.update);
router.post("/banwith/delete", ensureAuthenticated, ConBanwith.destroy);


//ROUTER PROFILE PAKET
router.get("/profile-group", ensureAuthenticated, ConProfilePaket.profileGroup);

router.get("/profile-hotspot", ensureAuthenticated, ConProfilePaket.profileHotspot);
router.get("/profile-hotspot/:id", ensureAuthenticated, ConProfilePaket.getProfileHotspot);

router.post("/profile-hotspot", ensureAuthenticated, ConProfilePaket.storeHotspot);

router.put("/profile-hotspot/:id", ensureAuthenticated, ConProfilePaket.updateHotspot);
router.post("/profile-hotspot/delete/:id", ensureAuthenticated, ConProfilePaket.destroyHotspot);


router.get("/profile-pppoe", ensureAuthenticated, ConProfilePaket.profilePppoe);

//ROUTER PELANGGAN
router.get("/user-hotspot", ensureAuthenticated, ConPelanggan.userHotspot);
router.post("/user-hotspot", ensureAuthenticated, ConPelanggan.addUserHotspot);
router.delete("/user-hotspot/:id", ensureAuthenticated, ConPelanggan.deleteUserHotspot);

//ROUTER MGMN SELLER
router.get("/settings-sellers", ensureAuthenticated, Seller.index);
router.get("/add-new-sellers", ensureAuthenticated, Seller.tambahBaru);
router.post("/add-new-sellers", ensureAuthenticated, Seller.simpanSeller);
router.get("/products-sellers", ensureAuthenticated, Seller.sellerProduct);
router.get("/add-seller-product", ensureAuthenticated, Seller.addSellerProduct);
router.post("/add-seller-product", ensureAuthenticated, Seller.prosessAddSellerProduct);

//ROUTER PRODUCT
router.get("/products", ensureAuthenticated, Product.index);
router.get("/add_new_product", ensureAuthenticated, Product.addNewProduct);
router.post("/add_new_product", upload.single("gambar"), ensureAuthenticated, Product.saveNewProduct);

router.get("/user-pppoe", ensureAuthenticated, ConPelanggan.userPppoe);

//ROUTER KARTU VOUCHER
router.get("/kartu-voucher", ensureAuthenticated, ConCardVcr.index);
router.get("/template-voucher", ensureAuthenticated, ConCardVcr.templateVcr);
router.post("/kartu-voucher", ensureAuthenticated, ConCardVcr.generateBulkVouchers);
router.get("/kartu-voucher/cetak", ensureAuthenticated, ConCardVcr.cetakFiltered);


router.post("/kartu-voucher/template/add", ensureAuthenticated, ConCardVcr.addTemplate);
router.get("/kartu-voucher/preview/:id", ensureAuthenticated, ConCardVcr.previewTpl);
router.put('/kartu-voucher/template/update/:id', ensureAuthenticated, ConCardVcr.updateTemplate);
router.delete('/kartu-voucher/template/delete/:id', ensureAuthenticated, ConCardVcr.deleteTemplate);


//ROUTER KEUANGAN
router.get("/keuangan", ensureAuthenticated, ConKeuangan.index);
router.get("/pengeluaran", ensureAuthenticated, ConKeuangan.pengeluaran);
router.get("/hutangpiutang", ensureAuthenticated, ConKeuangan.piutang);

module.exports = router;
