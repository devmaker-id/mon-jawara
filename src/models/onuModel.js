const db = require("../config/db");

class OnuModel {
  
  static async findAll() {
    try {
      const sql = `SELECT * FROM tbl_onu`;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getById(id) {
    const sql = "SELECT * FROM tbl_onu WHERE id = ?";
    const [reault] = await db.query(sql, [id]);
    return reault[0] || null;
  }
  static async getByOdpId(id) {
    const sql = "SELECT * FROM tbl_onu WHERE id_odp = ?";
    const [reault] = await db.query(sql, [id]);
    return reault;
  }
  static async generateNoInternet() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const today = `${yyyy}${mm}${dd}`;

    const sql = `SELECT MAX(no_internet) AS lastNo 
                 FROM tbl_onu 
                 WHERE no_internet LIKE ?`;
    const likePattern = `${today}%`;

    const [rows] = await db.query(sql, [likePattern]);
    let lastNo = rows[0]?.lastNo;

    let counter = 1;
    if (lastNo) {
      const lastCounter = parseInt(lastNo.slice(-3)); // ambil 3 digit terakhir
      counter = lastCounter + 1;
    }

    const newNo = today + String(counter).padStart(3, "0");
    return newNo;
  }

  static async create(data) {
    try {
      const no_internet = await this.generateNoInternet();
      const sql = `
        INSERT INTO tbl_onu 
        (no_internet, nama, lokasi, id_odp, name_odp, optic_status, epon_port, onu_id, onu_mac, status, telepon, email, paket, alamat_lengkap, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const values = [
        no_internet,
        data.nama,
        data.lokasi,
        data.id_odp,
        data.name_odp || null,
        data.optic_status || "linkdown",
        data.epon_port || "0/0",
        data.onu_id || "0",
        data.onu_mac,
        data.status || "unverifed",
        data.telepon || null,
        data.email || null,
        data.paket || null,
        data.alamat_lengkap || null
      ];
  
      const [result] = await db.query(sql, values);
      return result.insertId; // penting biar bisa update pelanggan.onu_id
    } catch (error) {
      console.error("Error in OnuModel.create:", error.message);
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      const sql = `
        UPDATE tbl_onu
        SET 
          nama = ?, 
          no_internet = ?, 
          lokasi = ?, 
          id_odp = ?, 
          updated_at = NOW()
        WHERE id = ?
      `;
      const values = [
        data.nama,
        data.no_internet,
        data.lokasi,
        data.id_odp,
        id
      ];
  
      const [result] = await db.query(sql, values);
      return result.affectedRows > 0; // true kalau ada row yang diupdate
    } catch (error) {
      console.error("Error in OnuModel.update:", error.message);
      throw error;
    }
  }
  
  static async delete(id) {
    const sql = "DELETE FROM tbl_onu WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result;
  }

}

module.exports = OnuModel;