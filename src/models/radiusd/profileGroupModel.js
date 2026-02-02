const db = require("../../config/db");

class ProfileGroup {
  
  static async findByServiceType(type, owner_id) {
    const sql = "SELECT * FROM tbl_profile_group WHERE service_type = ? AND owner_id = ?";
    const values = [type, owner_id];
    try {
      const [results] = await db.query(sql, values);
      const formattedResults = results.map(row => ({
        ...row,
        modal_format: Intl.NumberFormat('id-ID').format(Number(row.harga_modal)),
        jual_format: Intl.NumberFormat('id-ID').format(Number(row.harga_jual))
      }));
      return formattedResults;
    } catch (err) {
      throw err;
    }
  }
  static async findById(id) {
    const sql = "SELECT * FROM tbl_profile_group WHERE id = ?";
    const values = [id];
    try {
      const [results] = await db.query(sql, values);
      return results ? results[0] : null;
    } catch (err) {
      throw err;
    }
  }
  static async findByName(groupname) {
    const sql = "SELECT * FROM tbl_profile_group WHERE groupname = ?";
    const values = [groupname];
    try {
      const [results] = await db.query(sql, values);
      return results ? results[0] : null;
    } catch (err) {
      throw err;
    }
  }
  static async create(data) {
    const sql = `
      INSERT INTO tbl_profile_group 
      (groupname, service_type, harga_modal, harga_jual, speed_internet, shared_users, durasi, expired, owner_id, owner_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.groupname,
      data.service_type,
      data.harga_modal,
      data.harga_jual,
      data.speed_internet,
      data.shared_users,
      data.durasi,
      data.expired,
      data.owner_id,
      data.owner_name
    ];
    
    try {
      const [result] = await db.query(sql, values);
      return result;
    } catch (err) {
      console.error("Insert error:", err);
      throw err;
    }
  }
  static async update(data) {
    const sql = `
      UPDATE tbl_profile_group 
      SET 
        groupname = ?,
        harga_modal = ?,
        harga_jual = ?,
        speed_internet = ?,
        shared_users = ?,
        durasi = ?,
        expired = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
  
    const values = [
      data.groupname,
      data.harga_modal,
      data.harga_jual,
      data.speed_internet,
      data.shared_users,
      data.durasi,
      data.expired,
      data.id
    ];
    
    try {
      const [result] = await db.query(sql, values);
      return result;
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    }
  }

  static async delete(id) {
    try {
      const sql = "DELETE FROM tbl_profile_group WHERE id = ?";
      const [result] = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in delete:", error.message);
      throw error;
    }
  }
  
}

module.exports = ProfileGroup;