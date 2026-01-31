const db = require("../config/db");

class SubdomainModel {
  
  static async createData(params) {
    try {
      const sql = `INSERT INTO tbl_subdomain (user_id, ros_version, domain, root_domain, full_domain, created_at, updated_at) VALUES ( ?, ?, ?, ?, ?, NOW(), NOW() )`;
      const values = [
        params.user_id,
        params.ros_version,
        params.domain,
        params.root_domain,
        params.full_domain
      ];
      const [results] = await db.query(sql, values);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async findByFullDomain(domain) {
    try {
      const sql = `SELECT * FROM tbl_subdomain WHERE full_domain = ?`;
      const value = [domain];
      const [results] = await db.query(sql, value);
      return results[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async checkDomain(domain) {
    try {
      const [rows] = await db.query('SELECT id FROM tbl_subdomain WHERE domain = ?', [domain]);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async getAllUserId(userid) {
    try {
      const [results] = await db.query(`SELECT * FROM tbl_subdomain WHERE user_id = ?`, [userid]);
      return results;
    } catch (error) {
      throw error;
    }
  }
  
  static async deleteByid(id, userid) {
    try {
      const [results] = await db.query(`DELETE FROM tbl_subdomain WHERE id = ? AND user_id = ?`, [id, userid]);
      return results;
    } catch (error) {
      throw error;
    }
  }
  
}

module.exports = SubdomainModel;