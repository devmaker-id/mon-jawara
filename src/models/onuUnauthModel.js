const db = require("../config/db");

class OnuUnauthModel {
  
  static async findAll() {
    try {
      const sql = `SELECT * FROM tbl_onu_unauth`;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getByMac(mac) {
    try {
      const sql = `SELECT * FROM tbl_onu_unauth where mac_onu = ?`;
      const [results] = await db.query(sql, mac);
      return results[0] || null;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async delete(mac) {
    try {
      const sql = `DELETE FROM tbl_onu_unauth WHERE mac_onu = ?`;
      const [result] = await db.query(sql, [mac]);
      return result;
    } catch (error) {
      console.error("Gagal menghapus data Onu Unauth:", error.message);
      throw error;
    }
  }

}

module.exports = OnuUnauthModel;
