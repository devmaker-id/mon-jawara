const db = require("../../config/db");

class VpnModel {
  // =====================================
  // 🔹 Ambil semua data limit akun (join username)
  // =====================================
  static async getAllData() {
    try {
      const sql = `
        SELECT 
          l.id,
          l.user_id,
          u.username,
          l.\`limit\`,
          l.used,
          l.created_at,
          l.updated_at
        FROM tbl_limit_akun_vpn l
        JOIN tbl_users u ON l.user_id = u.id
        ORDER BY l.id DESC
      `;
      const [rows] = await db.query(sql);
      return rows;
    } catch (err) {
      console.error("Error getAllData:", err.message);
      throw err;
    }
  }

  // =====================================
  // 🔹 Ambil semua user untuk dropdown
  // =====================================
  static async getAllUser() {
    try {
      const sql = `SELECT id, username FROM tbl_users ORDER BY username ASC`;
      const [rows] = await db.query(sql);
      return rows;
    } catch (err) {
      console.error("Error getAllUser:", err.message);
      throw err;
    }
  }

  // =====================================
  // 🔹 Ambil semua akun VPN (tidak digunakan di limit tapi tetap ada)
  // =====================================
  static async allAccount() {
    try {
      const sql = `SELECT * FROM tbl_akun_vpn ORDER BY id DESC`;
      const [rows] = await db.query(sql);
      return rows;
    } catch (error) {
      console.error("Error allAccount:", error);
      throw error;
    }
  }

  // =====================================
  // 🔹 Ambil 1 data limit berdasarkan ID
  // =====================================
  static async getLimitById(id) {
    try {
      const sql = `
        SELECT 
          l.id,
          l.user_id,
          u.username,
          l.\`limit\`,
          l.used,
          l.created_at,
          l.updated_at
        FROM tbl_limit_akun_vpn l
        JOIN tbl_users u ON l.user_id = u.id
        WHERE l.id = ?
      `;
      const [rows] = await db.query(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error getLimitById:", error);
      throw error;
    }
  }

  // =====================================
  // 🔹 Ambil data limit berdasarkan username
  // =====================================
  static async getLimitByUsername(username) {
    try {
      const sql = `
        SELECT 
          l.id,
          l.user_id,
          u.username,
          l.\`limit\`,
          l.used,
          l.created_at,
          l.updated_at
        FROM tbl_limit_akun_vpn l
        JOIN tbl_users u ON l.user_id = u.id
        WHERE u.username = ?
      `;
      const [rows] = await db.query(sql, [username]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error getLimitByUsername:", error);
      throw error;
    }
  }

  // =====================================
  // 🔹 Tambah data limit akun baru
  // =====================================
  static async createLimit({ user_id, username, limit }) {
    try {
      const now = new Date();
      const sql = `
        INSERT INTO tbl_limit_akun_vpn (user_id, username, \`limit\`, used, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
      `;
      const [result] = await db.query(sql, [user_id, username, limit, now, now]);

      // Ambil data yang baru disimpan (supaya bisa dikembalikan ke frontend)
      const [newRow] = await db.query(
        `SELECT * FROM tbl_limit_akun_vpn WHERE id = ?`,
        [result.insertId]
      );

      return newRow[0];
    } catch (error) {
      console.error("Error createLimit:", error);
      throw error;
    }
  }

  // =====================================
  // 🔹 Update limit berdasarkan ID
  // =====================================
  static async updateLimitById(id, { user_id, username, limit }) {
    try {
      const sql = `
        UPDATE tbl_limit_akun_vpn 
        SET user_id = ?, username = ?, \`limit\` = ?, updated_at = NOW()
        WHERE id = ?
      `;
      const [result] = await db.query(sql, [user_id, username, limit, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updateLimitById:", error);
      throw error;
    }
  }

  // =====================================
  // 🔹 Hapus limit berdasarkan ID
  // =====================================
  static async deleteLimitById(id) {
    try {
      const sql = `DELETE FROM tbl_limit_akun_vpn WHERE id = ?`;
      const [result] = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleteLimitById:", error);
      throw error;
    }
  }
}

module.exports = VpnModel;
