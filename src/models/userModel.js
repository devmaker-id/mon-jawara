const db = require("../config/db");
const bcrypt = require("bcryptjs");

class UserModel {
  static async insertUser(params) {
    try {
      const sql = `INSERT INTO tbl_users (username, password, email, api_key) VALUES (?, ?, ?, ?)`;
      const values = [
        params.username,
        params.password,
        params.email,
        params.apiKey
      ];
      const [results] = await db.query(sql, values);
      return results.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM tbl_users"
    );
    return rows;
  }
  
  static async updateProfile(id, { fullname, phone, address }) {
    const sql = `UPDATE tbl_users SET fullname = ?, telepon = ?, alamat = ? WHERE id = ?`;
    const [result] = await db.query(sql, [fullname, phone, address, id]);
    return result.affectedRows > 0;
  }

  static async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM tbl_users WHERE id = ?", [id]
    );
    return rows[0];
  }
  
  static async findByUsername(username) {
    const [rows] = await db.query(
      "SELECT * FROM tbl_users WHERE username = ?", [username]
    );
    return rows[0];
  }
  
  static async getByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM tbl_users WHERE email = ?", [email]
    );
    return rows[0];
  }
  
  static async findApiKey(key) {
    try {
      const [rows] = await db.query("SELECT * FROM tbl_users WHERE api_key = ?", [key]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async findBySalt(salt) {
    const [rows] = await db.query(
      "SELECT * FROM tbl_users WHERE salt_webhook = ?", [salt]
    );
    return rows[0];
  }
  
  static async verifLoginUser(username, plainPassword) {
    const user = await this.findByUsername(username);
    if (!user) return null;
    
    const passwordMatch = await bcrypt.compare(plainPassword, user.password);
    if (!passwordMatch) return null;
    
    return user; //login suksess
  }
  
  static async verifyUser(apiKey) {
    try {
      const [result] = await db.query(`UPDATE tbl_users SET is_verified = 1 WHERE api_key = ? AND is_verified = 0`, [apiKey]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
}

module.exports = UserModel;
