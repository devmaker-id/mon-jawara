const db = require("../../config/db");

class MikrotikModel {

  // Ambil semua data
  static async all() {
    try {
      const sql = `SELECT * FROM tbl_mikrotik ORDER BY id DESC`;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  // Cari data by ID
  static async findById(id) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE id = ?`;
      const [results] = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  // Cari data by ID
  static async getByHost(host) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE host = ?`;
      const [results] = await db.query(sql, [host]);
      return results[0] || null;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  // Model Tambah Mikrotik baru
  static async add(data) {
    try {
      const {
        name,
        ros,
        olt_used = null,
        nas_used = null,
        host,
        port_api,
        username,
        password
      } = data;

      const sql = `
        INSERT INTO tbl_mikrotik
        (name, ros, olt_used, nas_used, host, port_api, username, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        name,
        ros,
        olt_used,
        nas_used,
        host,
        port_api,
        username,
        password
      ]);

      return result.insertId; // lebih berguna dari sekadar true
    } catch (error) {
      console.error('Error add mikrotik:', error.message);
      throw error;
    }
  }

  // Update Mikrotik
  static async update(id, data) {
    try {
      const {
        name,
        olt_used = null,
        nas_used = null,
        host,
        ros,
        port_api,
        username,
        password
      } = data;

      const sql = `
        UPDATE tbl_mikrotik
        SET name = ?, olt_used = ?, nas_used = ?, host = ?, ros = ?, port_api = ?, username = ?, password = ?
        WHERE id = ?
      `;

      await db.query(sql, [
        name,
        olt_used,
        nas_used,
        host,
        ros,
        port_api,
        username,
        password,
        id
      ]);

      return true;
    } catch (error) {
      console.error('Update mikrotik error:', error.message);
      throw error;
    }
  }

  // Update Mikrotik Kusus Halaman mikortik client
  static async clientUpdate(id, data) {
    try {
      const {
        name,
        host,
        ros,
        port_api,
        username,
        password
      } = data;

      const sql = `
        UPDATE tbl_mikrotik
        SET name = ?, host = ?, ros = ?, port_api = ?, username = ?, password = ?
        WHERE id = ?
      `;

      await db.query(sql, [
        name,
        host,
        ros,
        port_api,
        username,
        password,
        id
      ]);

      return true;
    } catch (error) {
      console.error('Mikrotik Client error:', error.message);
      throw error;
    }
  }


  // Delete Mikrotik
  static async delete(id) {
    try {
      const sql = `DELETE FROM tbl_mikrotik WHERE id = ?`;
      await db.query(sql, [id]);
      return true;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

}

module.exports = MikrotikModel;
