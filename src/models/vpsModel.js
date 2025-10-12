const db = require("../config/db");

class VpsModel {
  
  static async allData() {
    try {
      const [results] = await db.query(`SELECT id, root_domain FROM tbl_vps_server`);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async getRootDomain(domain) {
    try {
      const [results] = await db.query(`SELECT * FROM tbl_vps_server WHERE root_domain = ?`, [domain]);
      return results[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
}

module.exports = VpsModel;