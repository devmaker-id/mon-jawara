const db = require("../config/db");

class PlnModel {
  // 🔍 Ambil semua data pelanggan
  static async findAll() {
    try {
      const sql = "SELECT * FROM tbl_pln ORDER BY created_at DESC";
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error("Error findAll:", error.message);
      throw error;
    }
  }

  // 🔍 Ambil data pelanggan berdasarkan ID
  static async findById(id) {
    try {
      const sql = "SELECT * FROM tbl_pln WHERE id = ?";
      const [results] = await db.query(sql, [id]);
      return results[0];
    } catch (error) {
      console.error("Error findById:", error.message);
      throw error;
    }
  }

  // ➕ Tambah data pelanggan baru
  static async create(data) {
    try {
      const sql = `
        INSERT INTO tbl_pln (nama, jenis_pln, alamat, no_pln, status, keterangan)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [
        data.nama,
        data.jenis_pln,
        data.alamat,
        data.no_pln || null,
        data.status || "aktif",
        data.keterangan || null,
      ];
      const [result] = await db.query(sql, values);
      return { id: result.insertId, ...data };
    } catch (error) {
      console.error("Error create:", error.message);
      throw error;
    }
  }

  // ✏️ Update data pelanggan berdasarkan ID
  static async update(id, data) {
    try {
      const sql = `
        UPDATE tbl_pln 
        SET nama = ?, jenis_pln = ?, alamat = ?, no_pln = ?, status = ?, keterangan = ?, updated_at = NOW()
        WHERE id = ?
      `;
      const values = [
        data.nama,
        data.jenis_pln,
        data.alamat,
        data.no_pln || null,
        data.status || "aktif",
        data.keterangan || null,
        id,
      ];
      const [result] = await db.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error update:", error.message);
      throw error;
    }
  }

  // ❌ Hapus data pelanggan
  static async delete(id) {
    try {
      const sql = "DELETE FROM tbl_pln WHERE id = ?";
      const [result] = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error delete:", error.message);
      throw error;
    }
  }

  // =============================
  // 🔽 FITUR TRANSAKSI & BUKTI
  // =============================

  // 💰 Simpan transaksi PLN
  static async saveTransaksi(pln_id, nominal, keterangan = null) {
    try {
      const sql = `
        INSERT INTO tbl_pln_transaksi (pln_id, nominal, keterangan, created_at)
        VALUES (?, ?, ?, NOW())
      `;
      const [result] = await db.query(sql, [pln_id, nominal, keterangan]);
      return result.insertId;
    } catch (error) {
      console.error("Error saveTransaksi:", error.message);
      throw error;
    }
  }

  // 📸 Simpan bukti pembayaran (update transaksi terakhir milik pelanggan)
  static async saveBukti(pln_id, bukti_path) {
    try {
      const sql = `
        UPDATE tbl_pln_transaksi 
        SET bukti_path = ?, updated_at = NOW()
        WHERE pln_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const [result] = await db.query(sql, [bukti_path, pln_id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error saveBukti:", error.message);
      throw error;
    }
  }

  // 📜 Ambil riwayat transaksi PLN (join dengan pelanggan)
  static async findRiwayat() {
    try {
      const sql = `
        SELECT t.*, p.nama, p.jenis_pln, p.no_pln 
        FROM tbl_pln_transaksi t
        LEFT JOIN tbl_pln p ON t.pln_id = p.id
        ORDER BY t.created_at DESC
      `;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error("Error findRiwayat:", error.message);
      throw error;
    }
  }
}

module.exports = PlnModel;
