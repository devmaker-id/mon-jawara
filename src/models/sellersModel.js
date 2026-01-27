const db = require("../config/db");

class SupplierUser {
  
  static async allData() {
    try {
      const sql = "SELECT * FROM tbl_sellers";
      const [results] = await db.query(sql);
      return results;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  
  static async getAkunByUsername(username) {
    try {
      const radcheck = "SELECT * FROM radcheck WHERE username = ?";
      const usergroup = "SELECT * FROM radusergroup WHERE username = ?";
      const value = [username];
      
      const [result] = await db.query(usergroup, value);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  
  static async create(data) {
    const sql = `INSERT INTO tbl_sellers (name, alamat, telepon, email, catatan) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      data.name,
      data.alamat || null,
      data.telepon,
      data.email || null,
      data.catatan || null
    ];
    const [results] = await db.query(sql, values);
    return results;
  }

}

module.exports = SupplierUser;