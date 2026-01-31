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

  // Tambah Mikrotik baru
  static async add(data) {
    try {
      const { name, olt_used, nas_used, host, port_api, username, password } = data;
      const sql = `
        INSERT INTO tbl_mikrotik
        (name, olt_used, nas_used, host, port_api, username, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(sql, [name, olt_used || null, nas_used || null, host, port_api, username, password]);
      return true;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  // Update Mikrotik
  static async update(id, data) {
    try {
      const { name, olt_used, nas_used, host, ros, port_api, username, password } = data;
      const sql = `
        UPDATE tbl_mikrotik
        SET name = ?, olt_used = ?, nas_used = ?, host = ?, ros = ?, port_api = ?, username = ?, password = ?
        WHERE id = ?
      `;
      await db.query(sql, [name, olt_used || null, nas_used || null, host, ros, port_api, username, password, id]);
      return true;
    } catch (error) {
      console.error(error.message);
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
