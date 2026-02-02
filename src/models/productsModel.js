const db = require("../config/db"); // koneksi mysql2 pool/connection

class Products {
  // Ambil semua produk
  static async all() {
    const sql = "SELECT * FROM tbl_products WHERE status = 'active' ORDER BY nama ASC";
    const [rows] = await db.query(sql);
    return rows;
  }

  // Ambil produk berdasarkan ID
  static async findById(id) {
    const sql = "SELECT * FROM tbl_products WHERE product_id = ?";
    const [rows] = await db.query(sql, [id]);
    return rows[0]; // ambil 1 produk
  }

  // Tambah produk baru
  static async create(data) {
    const sql = `
      INSERT INTO tbl_products 
        (kode_produk, nama, harga, stok, satuan, deskripsi, status, gambar)
      VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    `;
    const values = [
      data.kode_produk,
      data.nama,
      parseInt(data.harga) || 0,   // harga integer
      parseInt(data.stok) || 0,    // stok integer
      data.satuan || null,
      data.deskripsi || null,
      data.gambar || null
    ];

    const [result] = await db.query(sql, values);
    return result.insertId;
  }

  // Update produk
  static async update(id, data) {
    const sql = `
      UPDATE tbl_products 
      SET kode_produk=?, nama=?, harga=?, stok=?, satuan=?, deskripsi=?, status=? 
      WHERE product_id=?
    `;
    const values = [
      data.kode_produk,
      data.nama,
      parseInt(data.harga) || 0,
      parseInt(data.stok) || 0,
      data.satuan,
      data.deskripsi,
      data.status || 'active',
      id
    ];
    const [result] = await db.query(sql, values);
    return result.affectedRows;
  }

  // Soft delete produk
  static async delete(id) {
    const sql = "UPDATE tbl_products SET status='inactive' WHERE product_id=?";
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }

  // Update stok
  static async updateStock(id, qty, mode = "minus") {
    let sql;
    if (mode === "minus") {
      sql = "UPDATE tbl_products SET stok = stok - ? WHERE product_id = ?";
    } else {
      sql = "UPDATE tbl_products SET stok = stok + ? WHERE product_id = ?";
    }
    const [result] = await db.query(sql, [qty, id]);
    return result.affectedRows;
  }
}

module.exports = Products;
