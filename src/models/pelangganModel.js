const db = require("../config/db");

class PelangganModel {
  
  static async findById(id) {
    try {
      const sql = "SELECT * FROM tbl_pelanggan WHERE id = ?";
      const [results] = await db.query(sql, [id]);
      return results[0] || null;
    } catch (error) {
      console.error("Error in findById:", error.message);
      throw error;
    }
  }


  static async getByServiceType(service) {
    try {
      const sql = "SELECT * FROM tbl_pelanggan WHERE service_type = ?";
      const [results] = await db.query(sql, [service]);
      return results;
    } catch (error) {
      console.error("Error in getByServiceType:", error.message);
      throw error;
    }
  }
  
  static async getOnuIsNull() {
    try {
      const sql = "SELECT * FROM tbl_pelanggan WHERE onu_id IS NULL";
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error("Error in:", error.message);
      throw error;
    }
  }
  static async getOnuId(onuId) {
    try {
      const sql = "SELECT * FROM tbl_pelanggan WHERE onu_id = ?";
      const [results] = await db.query(sql, [onuId]);
      return results[0] || null;
    } catch (error) {
      console.error("Error in:", error.message);
      throw error;
    }
  }
  static async updateOnuId(pelangganId, newOnu = null) {
    try {
      const sql = "UPDATE tbl_pelanggan SET onu_id = ? WHERE id = ?";
      const [results] = await db.query(sql, [newOnu, pelangganId]);
      return results;
    } catch (error) {
      console.error("Error in:", error.message);
      throw error;
    }
  }
  
  static async attachOnu(memberId, onuId) {
    try {
      const sql = `UPDATE tbl_pelanggan SET onu_id = ? WHERE id = ?`;
      const [result] = await db.query(sql, [onuId, memberId]);
      return result;
    } catch (error) {
      console.error("Error in attachOnu:", error.message);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const sql = "SELECT * FROM tbl_pelanggan WHERE username = ?";
      const [results] = await db.query(sql, [username]);
      return results[0] || null;
    } catch (error) {
      console.error("Error in findByUsername:", error.message);
      throw error;
    }
  }

  static async create(data) {
    try {
      const sql = `
        INSERT INTO tbl_pelanggan 
        (fullname, paket, user_type, service_type, username, secret, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
  
      const values = [
        data.fullname,
        data.paket,
        data.user_type,
        data.service_type,
        data.username,
        data.secret
      ];
  
      const [result] = await db.query(sql, values);
      return result;
    } catch (error) {
      console.error("Error in create:", error.message);
      throw error;
    }
  }
  
  static async delete(id) {
    const sql = "DELETE FROM tbl_pelanggan WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result;
  }

}

module.exports = PelangganModel;
