const db = require("../config/db");

class ProfileHotspotModel {
  
  // Ambil semua profile hotspot
  static async findAll() {
    const sql = `
      SELECT ph.*, b.name AS bandwidth_name, u.username AS user_name
      FROM tbl_profile_hotspot ph
      LEFT JOIN tbl_bandwidth b ON ph.bandwidth_id = b.id
      LEFT JOIN tbl_users u ON ph.user_id = u.id
      ORDER BY ph.created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  // Ambil profile berdasarkan ID
  static async findById(id) {
    const sql = "SELECT * FROM tbl_profile_hotspot WHERE id = ?";
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  }

  // Tambah data
  static async create(data) {
    const sql = `
      INSERT INTO tbl_profile_hotspot (
        nas_server, name, owner_username, limit_enabled, duration_value,
        duration_unit, expired_value, expired_unit, bandwidth_id,
        shared_users, harga_jual, harga_beli, note, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.nas_server,
      data.name,
      data.owner_username,
      data.limit_enabled,
      data.duration_value,
      data.duration_unit,
      data.expired_value,
      data.expired_unit,
      data.bandwidth_id,
      data.shared_users,
      data.harga_jual,
      data.harga_beli,
      data.note,
      data.user_id
    ];
    const [result] = await db.query(sql, params);
    return result.insertId;
  }

  // Update data
  static async update(id, data) {
    const sql = `
      UPDATE tbl_profile_hotspot SET
        nas_server = ?, name = ?, owner_username = ?, limit_enabled = ?,
        duration_value = ?, duration_unit = ?, expired_value = ?, expired_unit = ?,
        bandwidth_id = ?, shared_users = ?, harga_jual = ?, harga_beli = ?,
        note = ?, user_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      data.nas_server,
      data.name,
      data.owner_username,
      data.limit_enabled,
      data.duration_value,
      data.duration_unit,
      data.expired_value,
      data.expired_unit,
      data.bandwidth_id,
      data.shared_users,
      data.harga_jual,
      data.harga_beli,
      data.note,
      data.user_id,
      id
    ];
    const [result] = await db.query(sql, params);
    return result.affectedRows;
  }

  // Hapus profile
  static async delete(id) {
    const sql = "DELETE FROM tbl_profile_hotspot WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }

}

module.exports = ProfileHotspotModel;
