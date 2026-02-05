const db = require("../../config/db");

class RadiusServer {

  static async getAll() {
    const [rows] = await db.query(`SELECT * FROM tbl_rad_server`);
    return rows;
  }

  static async create(data) {
    const sql = `
      INSERT INTO tbl_rad_server
      (name, host, username, password, port_ssh, port_auth, port_acct, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    return db.query(sql, [
      data.name,
      data.host,
      data.username,
      data.password,
      data.port_ssh,
      data.port_auth,
      data.port_acct
    ]);
  }

  static async update(id, data) {
    const sql = `
      UPDATE tbl_rad_server SET
        name=?,
        host=?,
        username=?,
        password=?,
        port_ssh=?,
        port_auth=?,
        port_acct=?,
        updated_at=NOW()
      WHERE id=?
    `;
    return db.query(sql, [
      data.name,
      data.host,
      data.username,
      data.password,
      data.port_ssh,
      data.port_auth,
      data.port_acct,
      id
    ]);
  }

  static async delete(id) {
    return db.query(`DELETE FROM tbl_rad_server WHERE id=?`, [id]);
  }
}

module.exports = RadiusServer;