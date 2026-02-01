const db = require("../../config/db");

class OnuModel {
  
  static async getAll() {
    try {
      const sql = `SELECT * FROM tbl_onu`;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
}

module.exports = OnuModel;