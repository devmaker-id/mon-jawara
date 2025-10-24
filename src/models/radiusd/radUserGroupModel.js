const db = require("../../config/db");

class RadUserGroupMoel {

  static async findByName(groupname) {
    const sql = "SELECT * FROM radusergroup WHERE groupname = ?";
    const values = [groupname];
    try {
      const [results] = await db.query(sql, values);
      return results ? results[0] : null;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  
}

module.exports = RadUserGroupMoel;