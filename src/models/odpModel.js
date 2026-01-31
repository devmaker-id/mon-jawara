const db = require("../config/db");

class OdpModel {
  
  static async createOdp({ name, capacity, used, location, description }) {
    const sql = `
      INSERT INTO tbl_odp_pop (name, capacity, used, location, description)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, capacity, used, location, description]);
    return result;
  }

  static async findAll() {
    try {
      const sql = `SELECT * FROM tbl_odp_pop`;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  static async findById(id) {
    try {
      const sql = `SELECT * FROM tbl_odp_pop WHERE id = ?`;
      const [rows] = await db.query(sql, [id]);
      return rows[0]; // ambil satu saja
    } catch (err) {
      console.error("Gagal mengambil data ODP:", err.message);
      throw err;
    }
  }

  
  static async updateById(id, { name, capacity, used, location }) {
    try {
      const sql = `
        UPDATE tbl_odp_pop
        SET name = ?, capacity = ?, used = ?, location = ?
        WHERE id = ?
      `;
      const [result] = await db.query(sql, [name, capacity, used, location, id]);
      return result;
    } catch (error) {
      console.error("Gagal memperbarui data ODP:", error.message);
      throw error;
    }
  }

  static async updateUsed(id, used) {
    try {
      const sql = `UPDATE tbl_odp_pop SET used = ? WHERE id = ?`;
      const [result] = await db.query(sql, [used, id]);
      return result;
    } catch (err) {
      console.error("Gagal update used ODP:", err.message);
      throw err;
    }
  }

  
  static async delete(id) {
    try {
      const sql = `DELETE FROM tbl_odp_pop WHERE id = ?`;
      const [result] = await db.query(sql, [id]);
      return result;
    } catch (error) {
      console.error("Gagal menghapus data ODP:", error.message);
      throw error;
    }
  }


}

module.exports = OdpModel;
