const db = require("../../config/db");

class OnuModel {
  
  static async getAvailableOnu() {
    try {
      const sql = `SELECT id, nama, onu_mac FROM tbl_onu WHERE selleraccess_id IS NULL`;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const sql = `SELECT id, no_internet, nama, onu_mac, optic_status FROM tbl_onu WHERE id = ?`;
      const [results] = await db.query(sql, [id]);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
}

module.exports = OnuModel;