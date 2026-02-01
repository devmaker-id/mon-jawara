const db = require("../../config/db");
const ModSellers = require("../../models/sellersModel");
const ModProducts = require("../../models/productsModel");
const ModGroup = require("../../models/radiusd/profileGroupModel");
const UserGroup = require("../../models/radiusd/radUserGroupModel");

class SellerController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const sellers = await ModSellers.allData();
      
    res.render("seller/index", {
      title: "Manajemen Seller",
      data: { sellers },
      flashData
    });
  }
  
  static async tambahBaru(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
      
    res.render("seller/add_new", {
      title: "Tambah Seller Baru",
      flashData
    });
  }
  
  static async simpanSeller(req, res) {
    try {
      const { nama, alamat, telepon, email, catatan } = req.body;

      // Validasi sederhana (firewall kodingan)
      if (!nama || !telepon) {
        return res.status(400).json({
          success: false,
          message: "Nama dan Telepon wajib diisi"
        });
      }

      // Simpan ke database via model
      await ModSellers.create({
        name: nama,
        alamat,
        telepon,
        email,
        catatan
      });

      res.json({
        success: true,
        message: "Seller berhasil ditambahkan"
      });
    } catch (err) {
      console.error("Error simpanSeller:", err);
      res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat menyimpan seller"
      });
    }
  }
  
  static async sellerProduct(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const [rows] = await db.query(`
      SELECT 
        p.product_id,
        p.kode_produk,
        p.nama AS product_name,
        s.id AS seller_id,
        s.name AS seller_name,
        sp.id AS seller_product_id,
        sp.harga AS harga_seller,
        sp.stok_seller
      FROM tbl_seller_products sp
      JOIN tbl_products p ON sp.product_id = p.product_id
      JOIN tbl_sellers s ON sp.seller_id = s.id
      ORDER BY p.nama, s.name
    `);
    
    const sellers = await ModSellers.allData();
    //console.log(rows);
    
    res.render("admin/index_seller_product", {
      title: "Product Seller",
      data: { sellers, rows },
      flashData
    });
  }
  
  static async addSellerProduct(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const sellers = await ModSellers.allData();
    const products = await ModProducts.all();
      
    res.render("admin/add_seller_product", {
      title: "Produk Khusus Ke Seller",
      data: { sellers, products },
      flashData
    });
  }
  
  static async prosessAddSellerProduct(req, res) {
    try {
      console.log(req.body);
      const { product_id, seller_id, harga, stok_seller } = req.body;
  
      if (!product_id || !seller_id || !harga) {
        req.session.flashData = {
          type: "danger",
          text: "Produk, Seller, dan Harga wajib diisi!"
        };
        return res.redirect("/admin/seller/add-product");
      }
  
      await db.query(`
        INSERT INTO tbl_seller_products (product_id, seller_id, harga, stok_seller, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [product_id, seller_id, harga, stok_seller]);
  
      req.session.flashData = {
        type: "success",
        text: "Produk Seller berhasil ditambahkan!"
      };
      res.redirect("/admin/seller/products");
  
    } catch (err) {
      console.error("Error prosessAddSellerProduct:", err);
      req.session.flashData = {
        type: "danger",
        text: "Terjadi kesalahan saat menambahkan Produk Seller"
      };
      res.redirect("/admin/seller/products");
    }
  }
  
}

module.exports = SellerController;