const db = require("../../config/db");

class RadUserGroupMoel {

  static async findByName(groupname) {
    const sql = "SELECT * FROM radusergroup WHERE groupname = ?";
    const values = [groupname];
    try {
      const [results] = await db.query(sql, values);
      return results ? results[0] : null;
    } catch (err) {
      throw err;
    }
  }
  
  static async getAkunByProfileAndUsername(profile, username) {
    try {
      const sql = `
        SELECT 
          rc.username,
          rc.attribute,
          rc.value,
          rg.groupname
        FROM radcheck rc
        JOIN radusergroup rg ON rc.username = rg.username
        WHERE rg.groupname = ? AND rc.username = ?;
      `;
  
      const [rows] = await db.query(sql, [profile, username]);
      return rows; // bisa juga rows[0] kalau cuma 1 record
    } catch (err) {
      throw err;
    }
  }

  
}

module.exports = RadUserGroupMoel;