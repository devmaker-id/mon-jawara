const db = require("../../config/db");

class AccessModel {

    static async getAll() {
        try {
            const sql = `SELECT 
                sa.id AS access_id,
                sa.user_hs,
                sa.pass_hs,
                sa.status AS access_status,
                sa.created_at,
  
                s.name AS seller_name,
                s.alamat AS seller_alamat,
                s.telepon AS seller_telepon,
                s.email AS seller_email,

                o.nama AS onu_nama,
                o.no_internet,
                o.optic_status
            FROM tbl_seller_access sa
            LEFT JOIN tbl_sellers s ON s.access_id = sa.id
            LEFT JOIN tbl_onu o ON o.selleraccess_id = sa.id
            ORDER BY sa.id ASC
            `;
            const [rows] = await db.query(sql);
            return rows;
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    static async getAvailableSellers() {
        const sql = `SELECT id, name FROM tbl_sellers WHERE access_id IS NULL`;
        const [rows] = await db.query(sql);
        return rows;
    }

  static async create(params) {
    const { seller_id, onu_id, username, password, status } = params;
  
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // 0️⃣ Cek apakah username Hotspot sudah ada
      if (username) {
        const [existing] = await connection.query(
          "SELECT COUNT(*) AS cnt FROM radcheck WHERE username = ?",
          [username]
        );
        if (existing[0].cnt > 0) {
          throw new Error(`Username Hotspot '${username}' sudah ada`);
        }
      }
  
      // 1️⃣ Insert ke tbl_seller_access
      const sqlAccess = `
        INSERT INTO tbl_seller_access
        (seller_id, onu_id, user_hs, pass_hs, status, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      const [resultAccess] = await connection.query(sqlAccess, [seller_id, onu_id, username, password, status]);
      const accessId = resultAccess.insertId;
  
      // 2️⃣ Update tbl_onu
      if (onu_id) {
        const sqlOnu = `
          UPDATE tbl_onu
          SET selleraccess_id = ?
          WHERE id = ?
        `;
        const [resOnu] = await connection.query(sqlOnu, [accessId, onu_id]);
        if (resOnu.affectedRows === 0) {
          throw new Error("ONU tidak ditemukan atau gagal diupdate");
        }
      }
  
      // 3️⃣ Update tbl_sellers
      if (seller_id) {
        const sqlSeller = `
          UPDATE tbl_sellers
          SET access_id = ?
          WHERE id = ?
        `;
        const [resSeller] = await connection.query(sqlSeller, [accessId, seller_id]);
        if (resSeller.affectedRows === 0) {
          throw new Error("Seller tidak ditemukan atau gagal diupdate");
        }
      }
  
      // 4️⃣ Buat user Hotspot di FreeRADIUS (radcheck + radusergroup)
      if (username && password) {
        // radcheck
        await connection.query(
          "INSERT INTO radcheck (username, attribute, op, value) VALUES (?, 'Cleartext-Password', ':=', ?)",
          [username, password]
        );
  
        // radusergroup → assign ke KELUARGA-BIBIT
        await connection.query(
          "INSERT INTO radusergroup (username, groupname, priority) VALUES (?, 'KELUARGA-BIBIT', 8)",
          [username]
        );
      }
  
      await connection.commit();
  
      return {
        success: true,
        accessId,
        message: "Access seller dan user Hotspot berhasil dibuat"
      };
  
    } catch (err) {
      await connection.rollback();
      console.error("Error create AccessSeller:", err.message);
      throw err;
  
    } finally {
      connection.release();
    }
  }
  
  static async delete(accessId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // 1️⃣ Ambil data access dulu (username Hotspot, seller_id, onu_id)
      const [rows] = await connection.query(
        "SELECT user_hs, seller_id, onu_id FROM tbl_seller_access WHERE id = ?",
        [accessId]
      );
  
      if (rows.length === 0) {
        throw new Error("Access seller tidak ditemukan");
      }
  
      const { user_hs, seller_id, onu_id } = rows[0];
  
      // 2️⃣ Hapus / reset relasi di tbl_onu
      if (onu_id) {
        await connection.query(
          "UPDATE tbl_onu SET selleraccess_id = NULL WHERE id = ?",
          [onu_id]
        );
      }
  
      // 3️⃣ Hapus / reset relasi di tbl_sellers
      if (seller_id) {
        await connection.query(
          "UPDATE tbl_sellers SET access_id = NULL WHERE id = ?",
          [seller_id]
        );
      }
  
      // 4️⃣ Hapus user Hotspot di FreeRADIUS
      if (user_hs) {
        await connection.query("DELETE FROM radcheck WHERE username = ?", [user_hs]);
        await connection.query("DELETE FROM radusergroup WHERE username = ?", [user_hs]);
      }
  
      // 5️⃣ Hapus access seller
      const [resDelete] = await connection.query("DELETE FROM tbl_seller_access WHERE id = ?", [accessId]);
  
      if (resDelete.affectedRows === 0) {
        throw new Error("Gagal menghapus access seller");
      }
  
      await connection.commit();
      return { success: true, message: "Access seller berhasil dihapus" };
  
    } catch (err) {
      await connection.rollback();
      console.error("Error delete AccessSeller:", err.message);
      throw err;
    } finally {
      connection.release();
    }
  }


}

module.exports = AccessModel;