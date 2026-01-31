const db = require("../config/db");

class LimitModel {
  
  static async getLimit(userid) {
    try {
      const sql = "SELECT * FROM tbl_limit_akun_vpn WHERE user_id = ?";
      const [result] = await db.query(sql, [userid]);
      return result[0];
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }
  
  static async getAllData() {
    try {
      const sql = `
        SELECT 
          l.id,
          l.user_id,
          u.username,
          l.limit,
          l.used,
          l.created_at,
          l.updated_at
        FROM tbl_limit_akun_vpn l
        JOIN tbl_users u ON l.user_id = u.id
      `;
      const [result] = await db.query(sql);
      return result;
    } catch (err) {
      console.error("Query error:", err.message);
      throw err;
    }
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM tbl_limit_akun_vpn WHERE id = ?", [id]);
    return rows[0];
  }
  
  static async updateLimitById(id, limit) {
    await db.query("UPDATE tbl_limit_akun_vpn SET `limit` = ?, updated_at = NOW() WHERE id = ?", [limit, id]);
  }
  
  static async updateUsedByUserId(userid, newused) {
    await db.query("UPDATE tbl_limit_akun_vpn SET used = ?, updated_at = NOW() WHERE user_id = ?", [newused, userid]);
  }

  
}
module.exports = LimitModel;