const db = require("../../config/db");

class RadCheckModel {
  /**
   * Tambah attribute ke radcheck
   */
  static async create({ username, attribute, op = ":=", value }) {
    const sql = `
      INSERT INTO radcheck (username, attribute, op, value)
      VALUES (?, ?, ?, ?)
    `;
    return db.query(sql, [username, attribute, op, value]);
  }

  /**
   * Set password user (Cleartext-Password)
   */
  static async setPassword(username, password, conn = db) {
    const sql = `
        INSERT INTO radcheck (username, attribute, op, value)
        VALUES (?, 'Cleartext-Password', ':=', ?)
    `;
    return conn.query(sql, [username, password]);
  }

  /**
   * Ambil semua attribute user
   */
  static async findByUsername(username) {
    const sql = `
      SELECT * FROM radcheck WHERE username = ?
    `;
    const [rows] = await db.query(sql, [username]);
    return rows;
  }

  /**
   * Hapus semua attribute user
   */
  static async deleteByUsername(username) {
    const sql = `
      DELETE FROM radcheck WHERE username = ?
    `;
    return db.query(sql, [username]);
  }
}

module.exports = RadCheckModel;