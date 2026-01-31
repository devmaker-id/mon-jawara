const db = require("../config/db");

class BandwidthModel {

  // Ambil semua data
  static async findAll() {
    try {
      const sql = "SELECT * FROM tbl_bandwidth ORDER BY created_at DESC";
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error("Error in findAll:", error.message);
      throw error;
    }
  }

  // Ambil satu berdasarkan ID
  static async findById(id) {
    try {
      const sql = "SELECT * FROM tbl_bandwidth WHERE id = ?";
      const [results] = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      console.error("Error in findById:", error.message);
      throw error;
    }
  }

  // Tambah data baru
  static async create(data) {
    try {
      const sql = `
        INSERT INTO tbl_bandwidth (
          name, min_upload, unit_min_upload, max_upload, unit_max_upload,
          min_download, unit_min_download, max_download, unit_max_download,
          description, owner_name, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        data.name, data.min_upload, data.unit_min_upload,
        data.max_upload, data.unit_max_upload,
        data.min_download, data.unit_min_download,
        data.max_download, data.unit_max_download,
        data.description || null, data.owner_name || null,
        data.user_id
      ];
      const [result] = await db.query(sql, values);
      return result.insertId;
    } catch (error) {
      console.error("Error in create:", error.message);
      throw error;
    }
  }

  // Update data
  static async update(id, data) {
    try {
      const sql = `
        UPDATE tbl_bandwidth SET
          name = ?, min_upload = ?, unit_min_upload = ?,
          max_upload = ?, unit_max_upload = ?,
          min_download = ?, unit_min_download = ?,
          max_download = ?, unit_max_download = ?,
          description = ?, owner_name = ?, user_id = ?,
          updated_at = NOW()
        WHERE id = ?
      `;
      const values = [
        data.name, data.min_upload, data.unit_min_upload,
        data.max_upload, data.unit_max_upload,
        data.min_download, data.unit_min_download,
        data.max_download, data.unit_max_download,
        data.description || null, data.owner_name || null,
        data.user_id, id
      ];
      const [result] = await db.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in update:", error.message);
      throw error;
    }
  }

  // Hapus data
  static async delete(id) {
    try {
      const sql = "DELETE FROM tbl_bandwidth WHERE id = ?";
      const [result] = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in delete:", error.message);
      throw error;
    }
  }
  
}

module.exports = BandwidthModel;
