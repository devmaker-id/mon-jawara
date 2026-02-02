const db = require("../config/db");
const ModSellers = require('../models/sellersModel');
const ModProducts = require('../models/productsModel');

class KasirController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    try {
      // Summary total penjualan
      // const [rows1] = await db.query("SELECT SUM(grand_total) AS total_penjualan, COUNT(*) AS total_transaksi FROM tbl_sales");
      const [rows1] = await db.query(`
        SELECT 
          SUM(grand_total) AS total_penjualan,
          COUNT(*) AS total_transaksi
        FROM tbl_sales
        WHERE created_at >= CURDATE()
          AND created_at < CURDATE() + INTERVAL 1 DAY
      `);

      
      // Produk terjual
      // const [rows2] = await db.query("SELECT SUM(qty) AS total_produk FROM tbl_sales_details");
      const [rows2] = await db.query(`
        SELECT 
          SUM(d.qty) AS total_produk
        FROM tbl_sales_details d
        JOIN tbl_sales s ON d.sales_id = s.sales_id
        WHERE s.created_at >= CURDATE()
          AND s.created_at < CURDATE() + INTERVAL 1 DAY
      `);


      // Grafik penjualan bulanan (contoh group by month)
      const [rows3] = await db.query(`
        SELECT DATE_FORMAT(tanggal, '%M') AS bulan, SUM(grand_total) AS total
        FROM tbl_sales
        GROUP BY MONTH(tanggal)
        ORDER BY MONTH(tanggal)
      `);

      // List penjualan terbaru
      // const [rows4] = await db.query(`
      //   SELECT s.sales_id, DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS tanggal, s.grand_total, s.status, sel.name AS nama_seller
      //   FROM tbl_sales s
      //   JOIN tbl_sellers sel ON s.seller_id = sel.id
      //   ORDER BY s.created_at DESC
      //   LIMIT 10
      // `);

      const [rows4] = await db.query(`
        SELECT 
          s.sales_id,
          DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS tanggal,
          s.grand_total,
          s.status,
          sel.name AS nama_seller
        FROM tbl_sales s
        JOIN tbl_sellers sel ON s.seller_id = sel.id
        WHERE s.created_at >= CURDATE()
          AND s.created_at < CURDATE() + INTERVAL 1 DAY
        ORDER BY s.created_at DESC
        LIMIT 10
      `);


      res.render("kasir/index", {
        title: "Dashboard Penjualan",
        flashData,
        summary: {
          total_penjualan: rows1[0].total_penjualan || 0,
          total_transaksi: rows1[0].total_transaksi || 0,
          total_produk: rows2[0].total_produk || 0,
          labels: rows3.map(r => r.bulan),
          data: rows3.map(r => r.total)
        },
        sales: rows4
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      res.status(500).send("Error load dashboard");
    }
  }
  
  static async detailTransaksi(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await db.query(`
        SELECT 
          d.detail_id,
          p.nama AS nama_produk,
          d.qty,
          d.harga,
          (d.qty * d.harga) AS subtotal
        FROM tbl_sales_details d
        JOIN tbl_products p ON d.product_id = p.product_id
        WHERE d.sales_id = ?
      `, [id]);
      //console.log(rows);
  
      res.json({ success: true, items: rows });
    } catch (err) {
      console.error("Error detailTransaksi:", err);
      res.json({ success: false, items: [] });
    }
  }
  
  
  // POST /penjualan/tambah
  static async simpanPenjualan(req, res) {
    const conn = await db.getConnection(); // transaksi biar aman
    try {
      await conn.beginTransaction();

      const {seller_id, grand_total, metode, status, keterangan, produk_id, harga, qty, subtotal } = req.body;

      // 1. Insert header ke tbl_sales
      const sqlSales = `
        INSERT INTO tbl_sales (seller_id, grand_total, metode, status, keterangan)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [salesResult] = await conn.query(sqlSales, [
        seller_id,
        parseInt(grand_total) || 0,
        metode,
        status,
        keterangan || null
      ]);

      const salesId = salesResult.insertId;

      // 2. Insert detail produk ke tbl_sales_details
      if (Array.isArray(produk_id)) {
        for (let i = 0; i < produk_id.length; i++) {
          const sqlDetail = `
            INSERT INTO tbl_sales_details (sales_id, product_id, qty, harga, subtotal)
            VALUES (?, ?, ?, ?, ?)
          `;
          await conn.query(sqlDetail, [
            salesId,
            produk_id[i],
            parseInt(qty[i]) || 0,
            parseInt(harga[i]) || 0,
            parseInt(subtotal[i]) || 0
          ]);

          // 3. Update stok produk (pusat/seller)
          const sqlUpdateStok = `UPDATE tbl_products SET stok = stok - ? WHERE product_id = ?`;
          await conn.query(sqlUpdateStok, [qty[i], produk_id[i]]);
        }
      } else {
        // jika hanya 1 produk (bukan array)
        const sqlDetail = `
          INSERT INTO tbl_sales_details (sales_id, product_id, qty, harga, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `;
        await conn.query(sqlDetail, [
          salesId,
          produk_id,
          parseInt(qty) || 0,
          parseInt(harga) || 0,
          parseInt(subtotal) || 0
        ]);

        const sqlUpdateStok = `UPDATE tbl_products SET stok = stok - ? WHERE product_id = ?`;
        await conn.query(sqlUpdateStok, [qty, produk_id]);
      }

      await conn.commit();

      req.session.flashData = {
        type: "success",
        text: "Penjualan berhasil disimpan!"
      };
      res.redirect("/kasir");
    } catch (err) {
      await conn.rollback();
      console.error("Error simpanPenjualan:", err);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat menyimpan penjualan"
      });
    } finally {
      conn.release();
    }
  }
  
  static async dataPenjualan(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const [rows] = await db.query(`
        SELECT s.sales_id, DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS tanggal, s.grand_total, s.status, sel.name AS nama_seller
        FROM tbl_sales s
        JOIN tbl_sellers sel ON s.seller_id = sel.id
        ORDER BY s.created_at DESC
      `);
    // const [rows] = await db.query(`
    //   SELECT 
    //     s.sales_id,
    //     DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS tanggal,
    //     s.grand_total,
    //     s.status,
    //     sel.name AS nama_seller
    //   FROM tbl_sales s
    //   JOIN tbl_sellers sel ON s.seller_id = sel.id
    //   WHERE DATE(s.created_at) = CURDATE()
    //   ORDER BY s.created_at DESC
    // `);

    //console.log(rows);
    
    res.render("kasir/penjualan", {
      title: "Laporan Penjualan",
      sales: rows,
      flashData
    });
  }
  
  static async tambahPenjualan(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const sellers = await ModSellers.allData();
    const products = await ModProducts.all();
    const sellerProducts = await db.query("SELECT * FROM tbl_seller_products");
    
    res.render("kasir/tambah-penjualan", {
      title: "menu kasir",
      sellers,
      products,
      sellerProducts,
      flashData
    });
  }
}

module.exports = KasirController;