const db = require("../../config/db");

class ClosingController {

  // GET /admin/closing
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    try {
      // Ambil filter tanggal dari query, default = 7 hari terakhir
      const start = req.query.start || new Date(Date.now() - 6*24*60*60*1000).toISOString().split('T')[0];
      const end = req.query.end || new Date().toISOString().split('T')[0];

      // 1. Closing harian
      const [daily] = await db.query(`
        SELECT DATE(created_at) AS tanggal,
               COUNT(*) AS total_transaksi,
               COALESCE(SUM(grand_total),0) AS total_penjualan
        FROM tbl_sales
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `, [start, end]);

      // 2. Closing per seller
      const [bySeller] = await db.query(`
        SELECT sel.name AS nama_seller,
               COUNT(*) AS total_transaksi,
               COALESCE(SUM(s.grand_total),0) AS total_penjualan
        FROM tbl_sales s
        JOIN tbl_sellers sel ON s.seller_id = sel.id
        WHERE DATE(s.created_at) BETWEEN ? AND ?
        GROUP BY s.seller_id
        ORDER BY total_penjualan DESC
      `, [start, end]);

      // 3. Closing per produk
      const [byProduct] = await db.query(`
        SELECT p.nama AS nama_produk,
               COALESCE(SUM(d.qty),0) AS total_qty,
               COALESCE(SUM(d.subtotal),0) AS total_penjualan
        FROM tbl_sales_details d
        JOIN tbl_products p ON d.product_id = p.product_id
        JOIN tbl_sales s ON d.sales_id = s.sales_id
        WHERE DATE(s.created_at) BETWEEN ? AND ?
        GROUP BY d.product_id
        ORDER BY total_penjualan DESC
      `, [start, end]);

      res.render("admin/closing/index", {
        title: "Laporan Closingan",
        flashData,
        filter: { start, end },
        daily,
        bySeller,
        byProduct
      });

    } catch (err) {
      console.error("ClosingController Error:", err);
      res.status(500).send("Terjadi kesalahan saat memuat laporan closingan");
    }
  }

}

module.exports = ClosingController;
