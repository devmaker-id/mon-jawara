// src/models/voucherModel.js
const dayjs = require('dayjs');
require('dayjs/locale/id');
dayjs.locale('id');

const db = require("../config/db");

class VcrModel {
  
  static async findAll() {
    try {
      const [results] = await db.query("SELECT * FROM tbl_vouchers");
  
      // Format created_at
      const formattedResults = results.map(row => ({
        ...row,
        price_format: Intl.NumberFormat('id-ID').format(Number(row.price)),
        created_at_formatted: dayjs(row.created_at).format('D MMMM YYYY')
      }));
  
      return formattedResults;
    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }
  
  static async create({ code, secret, type = "VOUCHER", service_type = "HOTSPOT", profile = "default" }) {
    try {
      const sql = `
        INSERT INTO tbl_vouchers (code, secret, type, service_type, profilegroup, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const values = [code, secret, type, service_type, profile];

      const [result] = await db.query(sql, values);
      return result;
    } catch (err) {
      console.error("Gagal menyimpan voucher:", err.message);
      throw err;
    }
  }
  
  static async bulkCreate(dataArray) {
    try {
      const sql = `
        INSERT INTO tbl_vouchers (code, secret, type, service_type, profilegroup, harga_beli, price, durasi, owner_id, owner_username, created_at, updated_at)
        VALUES ?
      `;
      const values = dataArray.map(item => [
        item.code,
        item.secret,
        item.type,
        item.service_type,
        item.profilegroup,
        item.harga_beli,
        item.price,
        item.durasi,
        item.owner_id,
        item.owner_username,
        item.created_at,
        item.updated_at,
      ]);
      
      const [result] = await db.query(sql, [values]);
      return result;
    } catch (error) {
      console.error("Gagal insert bulk voucher:", error.message);
      throw error;
    }
  }
  
  static async findFiltered({ tanggal, profile, owner_id }) {
    try {
      let sql = `SELECT * FROM tbl_vouchers WHERE 1=1`;
      const params = [];

      // Filter by tanggal (misalnya kolom created_at)
      if (tanggal) {
        sql += ` AND DATE(created_at) = ?`;
        params.push(tanggal);
      }

      // Filter by profile
      if (profile) {
        sql += ` AND profilegroup = ?`;
        params.push(profile);
      }

      // Filter by owner
      if (owner_id) {
        sql += ` AND owner_id = ?`;
        params.push(owner_id);
      }

      // Default order: terbaru
      //sql += ` ORDER BY created_at DESC LIMIT 500`;

      const [results] = await db.query(sql, params);
      return results;
    } catch (err) {
      console.error("findFiltered error:", err.message);
      throw err;
    }
  }

}

module.exports = VcrModel;