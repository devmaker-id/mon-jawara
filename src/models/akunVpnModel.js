const db = require("../config/db");

class AkunVpn {
  
  static async getIpPortApi(ip, portApi) {
    try {
      const sql = "SELECT * FROM tbl_akun_vpn WHERE server_host = ? AND public_port_api = ?";
      const [results] = await db.query(sql, [
        ip, portApi
      ]);
      return results ? results[0] : null;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  static async getById(userId) {
    try {
      const sql = "SELECT * FROM tbl_akun_vpn WHERE user_id = ?";
      const [results] = await db.query(sql, [
        userId
      ]);
      return results;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  
  static async getVpnId(vpnId) {
    try {
      const sql = "SELECT * FROM tbl_akun_vpn WHERE id = ?";
      const [results] = await db.query(sql, [
        vpnId
      ]);
      return results[0];
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  
  static async getPublicAccess(vpnid, userid) {
    try {
      const sql = `
        SELECT server_host, public_port_winbox, public_port_webfig, public_port_ssh, public_port_api, ip_vpn FROM tbl_akun_vpn WHERE id = ? AND user_id = ?
      `;
      const values = [vpnid, userid];
      const [results] = await db.query(sql, values);
      return results[0];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async createVpn(data, ret) {
    try {
      const sql = `
        INSERT INTO tbl_akun_vpn 
        (user_id, ret, server_name, server_host, type_vpn, port_vpn, public_port_winbox, public_port_webfig, public_port_ssh, public_port_api, username, password, gateway, ip_vpn, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
      `;
      const values = [
        data.user_id,
        ret,
        data.name,
        data.host,
        data.type,
        data.port,
        data.port_winbox,
        data.port_webfig,
        data.port_ssh,
        data.port_api,
        data.username,
        data.password,
        data.gateway,
        data.ip_vpn,
      ];
      const [result] = await db.query(sql, values);
      return result;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  
  static async getByIdNoUsed(userId) {
    try {
      const sql = "SELECT * FROM tbl_akun_vpn WHERE user_id = ? AND used_mikrotik IS NULL";
      const [results] = await db.query(sql, [
        userId
      ]);
      return results;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  
  static async updateUsedMikrotik(name, vpn_id) {
    try {
      const sql = `UPDATE tbl_akun_vpn SET used_mikrotik = ? WHERE id = ?`;
      const [results] = await db.query(sql, [name, vpn_id]);
      return results;
      
      if (results.affectedRows > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async deleteAkun(idvpn, iduser) {
    try {
      const sql = `DELETE FROM tbl_akun_vpn WHERE id = ? AND user_id = ?`;
      const [result] = await db.query(sql,[
        idvpn,
        iduser
      ]);
      return result;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
  
}

module.exports = AkunVpn;