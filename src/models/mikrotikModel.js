const db = require("../config/db");
const VpnModel = require("./akunVpnModel");
//const mikrotikHelper = require("../helpers/mikrotikHelper");

class MikrotikModel {
  static async findAll() {
    const [rows] = await db.query("SELECT * FROM tbl_mikrotik");
    return rows;
  }

  static async getAllHostByUserId(userId) {
    try {
      const sql = `SELECT id, name, nas_used, host FROM tbl_mikrotik WHERE user_id = ?`;
      const [rows] = await db.query(sql, [userId]);
      return rows;
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }
  static async getByUsedNas(nasused) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE nas_used = ?`;
      const [results] = await db.query(sql, [nasused]);
      return results ? results[0] : null;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  static async updateNasUsed(id, name) {
    try {
      let sql, values;
      if(name) {
        sql = `UPDATE tbl_mikrotik SET nas_used = ? WHERE id = ?`;
        values = [name, id];
      } else {
        sql = `UPDATE tbl_mikrotik SET nas_used = NULL WHERE id = ?`;
        values = [id];
      }
      const [results] = await db.query(sql, values);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  static async getByUserNoUsedNas(userid) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE user_id = ? AND nas_used IS NULL`;
      const [results] = await db.query(sql, [userid]);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  static async inputData(params) {
    try {
      const updateAkun = await VpnModel.updateUsedMikrotik(params.name, params.vpn_id);
      
      if (updateAkun) {
        const sql = `INSERT INTO tbl_mikrotik (user_id, vpn_id, name, ros, host, port_api, username, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
        const values = [
          params.user_id,
          params.vpn_id,
          params.name,
          params.ros,
          params.host,
          params.port_api,
          params.username,
          params.password
        ];
        const [rows] = await db.query(sql, values);
        return rows;
      } else {
        throw new Error("Gagal memperbarui status used_mikrotik");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async getByUser(userid) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE user_id = ?`;
      const [results] = await db.query(sql, [userid]);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE id = ?`;
      const [results] = await db.query(sql, [id]);
      return results[0];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getByUserNoUsedOlt(userid) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE user_id = ? AND olt_used IS NULL`;
      const [results] = await db.query(sql, [userid]);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async updateOltUsed(id, name) {
    try {
      let sql, values;
      if(name) {
        sql = `UPDATE tbl_mikrotik SET olt_used = ? WHERE id = ?`;
        values = [name, id];
      } else {
        sql = `UPDATE tbl_mikrotik SET olt_used = NULL WHERE id = ?`;
        values = [id];
      }
      const [results] = await db.query(sql, values);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async getByUserVpnid(userid, vpnid) {
    try {
      const sql = `SELECT * FROM tbl_mikrotik WHERE user_id = ? AND vpn_id = ?`;
      const values = [userid, vpnid];
      const [results] = await db.query(sql, values);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async deleteMikrotikClient(mikrotikid, vpnid) {
    const connection = await db.getConnection(); // ambil koneksi manual
    try {
      await connection.beginTransaction(); // mulai transaction
  
      // Step 1: Reset used_mikrotik di tbl_akun_vpn
      const [vpnUpdate] = await connection.query(
        "UPDATE tbl_akun_vpn SET used_mikrotik = NULL WHERE id = ?", 
        [vpnid]
      );
  
      if (vpnUpdate.affectedRows === 0) {
        throw new Error(`VPN ID ${vpnid} tidak ditemukan atau tidak bisa diupdate.`);
      }
  
      // Step 2: Delete dari tbl_mikrotik
      const [mkDelete] = await connection.query(
        "DELETE FROM tbl_mikrotik WHERE id = ?", 
        [mikrotikid]
      );
  
      if (mkDelete.affectedRows === 0) {
        throw new Error(`Mikrotik ID ${mikrotikid} tidak ditemukan atau sudah dihapus.`);
      }
  
      await connection.commit(); // kalau semua sukses, commit
      return {
        success: true,
        msg: 'Mikrotik client berhasil direset dan dihapus.'
      };
  
    } catch (error) {
      await connection.rollback(); // kalau error, rollback semua perubahan
      console.error('Transaction error:', error.message);
      throw error;
    } finally {
      connection.release(); // release koneksi, wajib
    }
  }

  static async getPublicAccess(mikrotikid) {
    try {
      const sql = `SELECT 
          m.*,
          a.public_port_winbox,
          a.public_port_webfig,
          a.public_port_ssh,
          a.public_port_api
      FROM 
          tbl_mikrotik AS m
      JOIN 
          tbl_akun_vpn AS a ON a.id = m.vpn_id
      WHERE 
          m.id = ?;
      `;
      const [result] = await db.query(sql, [mikrotikid]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
}

module.exports = MikrotikModel;
