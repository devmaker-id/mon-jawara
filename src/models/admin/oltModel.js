const db = require("../../config/db");

class OltModel {
  
  static async brandAll() {
    try {
      const sql = `SELECT * FROM tbl_olt_brand ORDER BY id DESC`;
      const [rows] = await db.query(sql);
      return rows;  // kembalikan array, bukan rows[0]
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async brandById(id) {
    try {
      const sql = `SELECT * FROM tbl_olt_brand WHERE id = ?`;
      const [rows] = await db.query(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async addBrand({ name, status = 'enable', keterangan = null }) {
    try {
      const sql = `INSERT INTO tbl_olt_brand (name, status, keterangan) VALUES (?, ?, ?)`;
      const [result] = await db.query(sql, [name.trim(), status, keterangan || null]);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateBrand(id, { name, status, keterangan }) {
    try {
      const sql = `UPDATE tbl_olt_brand SET name = ?, status = ?, keterangan = ? WHERE id = ?`;
      const [result] = await db.query(sql, [name.trim(), status, keterangan || null, id]);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteBrand(id) {
    try {
      const sql = `DELETE FROM tbl_olt_brand WHERE id = ?`;
      const [result] = await db.query(sql, [id]);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async all() {
    try {
      const sql = `
        SELECT o.*, b.name AS brand_name
        FROM tbl_olt o
        LEFT JOIN tbl_olt_brand b ON o.brand_id = b.id
        ORDER BY o.id DESC
      `;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

static async getById(id) {
    const sql = `
      SELECT o.*, b.name AS brand_name
      FROM tbl_olt o
      LEFT JOIN tbl_olt_brand b ON o.brand_id = b.id
      WHERE o.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async add(data) {
    const sql = `INSERT INTO tbl_olt (brand_id, name, host, status) VALUES (?, ?, ?, ?)`;
    const { brand_id, name, host, merk, status } = data;
    await db.query(sql, [brand_id, name, host, merk, status]);
  }

  static async update(id, data) {
    const sql = `UPDATE tbl_olt SET brand_id=?, name=?, host=?, status=? WHERE id=?`;
    const { brand_id, name, host, status } = data;
    await db.query(sql, [brand_id, name, host, status, id]);
  }

  static async delete(id) {
    const sql = `DELETE FROM tbl_olt WHERE id=?`;
    await db.query(sql, [id]);
  }

}

module.exports = OltModel;
