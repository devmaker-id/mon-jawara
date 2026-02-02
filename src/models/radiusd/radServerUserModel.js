const db = require("../../config/db");

class RadServerUserGroup {
  
  static async allGroup() {
    try {
      const sql = "SELECT * FROM tbl_radserverusergroup";
      const [results] = await db.query(sql);
      return results;
    } catch (err) {
      throw err;
    }
  }
  
  static async getServersByUserId(userId) {
    try {
      const sql = `
        SELECT rs.port_auth, rs.port_acct
        FROM tbl_radserverusergroup rug
        JOIN tbl_rad_server rs ON rug.rad_server_id = rs.id
        WHERE rug.user_id = ?
      `;
      const [results] = await db.query(sql, [userId]);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      throw err;
    }
  }

}

module.exports = RadServerUserGroup;