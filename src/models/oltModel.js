const db = require("../config/db");
const MikrotikModel = require("./mikrotikModel");

class OltModel {
  
  static async insertData(params) {
    try {
      const mk = await MikrotikModel.getById(params.mikrotik);
      const sql = `INSERT INTO tbl_olt (user_id, vpn_id, mikrotik_id, name, host, port, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await db.query(sql, [
        params.user_id,
        mk.vpn_id,
        params.mikrotik,
        params.name,
        params.host,
        23,
        params.username,
        params.password
      ]);
      return result;
  
    } catch (err) {
      console.error('Error insertData:', err.message);
      throw err;
    }
  }
  
  static async getByHost(host) {
    try {
      const sql = `SELECT user_id, host FROM tbl_olt WHERE host = ?`;
      const values = [host];
      const [results] = await db.query(sql, values);
      return results[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const sql = `SELECT * FROM tbl_olt WHERE id = ?`;
      const [result] = await db.query(sql, [id]);
      return result[0];
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  
  static async getByUserId(iduser) {
    try {
      //const sql = `SELECT * FROM tbl_olt WHERE user_id = ?`;
      const sql = `
      SELECT 
        o.id AS olt_id,
        o.user_id AS olt_user_id,
        o.name AS olt_name,
        o.host AS olt_host,
        o.port AS olt_port,
        o.username AS olt_username,
        o.password AS olt_password,
        o.vpn_id AS olt_vpn_id,

        v.user_id AS vpn_user_id,
        v.ret,
        v.server_name,
        v.server_host,
        v.type_vpn,
        v.port_vpn,
        v.public_port_winbox,
        v.public_port_webfig,
        v.public_port_ssh,
        v.public_port_api,
        v.username AS vpn_username,
        v.password AS vpn_password,
        v.gateway,
        v.ip_vpn,
        v.expired_at,
        v.status,
        v.created_at,
        v.updated_at

      FROM tbl_olt o
      LEFT JOIN tbl_akun_vpn v ON o.vpn_id = v.id
      WHERE o.user_id = ?
    `;
      const [rows] = await db.query(sql, [iduser]);
      return rows;
    } catch (err) {
      console.error('Error getByUserId:', err.message);
      throw err;
    }
  }
  
  static async getOltidUserid(userid, oltid) {
    try {
      const sql = `SELECT 
        olt.*, 
        vpn.server_name AS vpn_server_name,
        vpn.server_host AS vpn_server_host,
        vpn.username AS vpn_username,
        mik.name AS mikrotik_name,
        mik.host AS mikrotik_host,
        mik.ros AS mikrotik_ros
      FROM tbl_olt AS olt
      LEFT JOIN tbl_akun_vpn AS vpn ON olt.vpn_id = vpn.id
      LEFT JOIN tbl_mikrotik AS mik ON olt.mikrotik_id = mik.id
      WHERE olt.id = ? AND olt.user_id = ?`;
      const values = [oltid, userid];
      const [results] = await db.query(sql, values);
      return results[0];
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  
  static async deleteByIdAndUserId(id, user_id) {
    const sql = `DELETE FROM tbl_olt WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [id, user_id]);
    return result;
  }
  
  static async updateSnOlt(name, mac, sn, oltid) {
    try {
      const sql = `UPDATE tbl_olt SET promt_console = ?, mac_olt = ?, sn_olt = ? WHERE id = ?`;
      const values = [name, mac, sn, oltid];
      const [results] = await db.query(sql, values);
      return results;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  static async getAllowedIps() {
    try {
        const sql = `SELECT host FROM tbl_olt WHERE host IS NOT NULL`;
        const [results] = await db.query(sql);
        return results.map(row => row.host);
    } catch (error) {
        console.error(error);
        throw error;
    }
}


}

module.exports = OltModel;