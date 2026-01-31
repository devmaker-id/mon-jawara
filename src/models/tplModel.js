const db = require("../config/db");

class TemplateModel {
  
  static async insert(data) {
    try {
      const sql = `
        INSERT INTO tbl_templates 
        (name, status, html, owner_id, owner_username, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        data.name,
        data.status,
        data.html,
        data.owner_id,
        data.owner_username,
        data.created_at,
        data.updated_at,
      ];
      const [result] = await db.query(sql, values);
      return result;
    } catch (err) {
      console.error("Insert error:", err.message);
      throw err;
    }
  }

  
  static async findAll() {
    const [results] = await db.query("SELECT * FROM tbl_templates");
    return results;
  }
  
  static async getById(id){
    try {
      const sql = "SELECT * FROM tbl_templates WHERE id = ?";
      const values = id;
      const [results] = await db.query(sql, [values]);
      return results ? results[0] : null;
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }
  
  static async update(id, data) {
    const sql = `UPDATE tbl_templates SET name = ?, html = ?, status = ?, updated_at = NOW() WHERE id = ?`;
    await db.query(sql, [data.name, data.html, data.status, id]);
  }

  
  static async delete(id) {
    const sql = 'DELETE FROM tbl_templates WHERE id = ?';
    await db.query(sql, [id]);
  }

  
}

module.exports = TemplateModel;