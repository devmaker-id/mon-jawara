const db = require("../config/db");

class TypeVpnModel {
  
  static async getAll() {
    try {
      const sql = "SELECT * FROM tbl_vpn_types";
      const [rows] = await db.query(sql);
      return rows;
    } catch (err) {
      console.error("Gagal mengambil data VPN Types:", err.message);
      throw err;
    }
  }
  static async create(name) {
    try {
      await db.query("INSERT INTO tbl_vpn_types (name) VALUES (?)", [name]);
      return true;
    } catch (err) {
      console.error("Gagal menambahkan data:", err.message);
      throw err;
    }
  }
  
}

module.exports = TypeVpnModel;