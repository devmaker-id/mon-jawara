const db = require("../../config/db");

class NasModel {
  
  static async findAll() {
    try {
      const sql = "SELECT * FROM nas";
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const sql = "SELECT * FROM nas WHERE id = ?";
      const [results] = await db.query(sql, [id]);
      return results ? results[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  static async createNas(nasData) {
    try {
      const {
        nasname,
        shortname,
        type,
        secret,
        description,
        status
      } = nasData;
  
      const sql = `
        INSERT INTO nas (
          nasname, shortname, type, secret, description, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
  
      const [result] = await db.query(sql, [
        nasname,
        shortname,
        type,
        secret,
        description,
        status
      ]);
  
      return result.insertId;
    } catch (error) {
      console.error("Error in createNas:", error.message);
      throw error;
    }
  }
  
  static async deleteNas(id) {
    try {
      const sql = "DELETE FROM nas WHERE id = ?";
      const [result] = await db.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = NasModel;