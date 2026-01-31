// src/controllers/apiVoucherController.js

const db = require('../../config/db');
const dayjs = require('dayjs');
require('dayjs/locale/id');
dayjs.locale('id');

class ApiVoucherController {
  static async vcrHotspot(req, res) {
    try {
      const draw = parseInt(req.query.draw) || 1;
      const start = parseInt(req.query.start) || 0;
      const length = parseInt(req.query.length) || 10;
      const search = req.query['search[value]'] || '';
      const orderColIndex = req.query['order[0][column]'] || 0;
      const orderDir = req.query['order[0][dir]'] === 'desc' ? 'DESC' : 'ASC';

      const columns = ['code', 'secret', 'type', 'profilegroup', 'price', 'created_at', 'owner_username', 'expired', 'status'];
      const sortColumn = columns[orderColIndex] || 'created_at';

      let whereClause = 'WHERE 1=1';
      const params = [];

      // Batasi hanya jika search >= 3 karakter
      if (search.length >= 3) {
        whereClause += ` AND (
          code LIKE ? OR
          secret LIKE ? OR
          type LIKE ? OR
          profilegroup LIKE ? OR
          owner_username LIKE ? OR
          status LIKE ?
        )`;
        const keyword = `%${search}%`;
        params.push(keyword, keyword, keyword, keyword, keyword, keyword);
      } else if (search.length > 0 && search.length < 2) {
        // Kalau search < 3 karakter, kosongkan hasil
        return res.json({
          draw,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: []
        });
      }

      const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM tbl_vouchers');
      const [[{ filtered }]] = await db.query(`SELECT COUNT(*) as filtered FROM tbl_vouchers ${whereClause}`, params);

      const dataQuery = `
        SELECT * FROM tbl_vouchers
        ${whereClause}
        ORDER BY ${sortColumn} ${orderDir}
        LIMIT ?, ?
      `;
      params.push(start, length);
      const [rows] = await db.query(dataQuery, params);

      const data = rows.map((v, i) => ({
        no: start + i + 1,
        code: v.code,
        secret: v.type === 'VOUCHER' ? '-' : v.secret,
        type: v.type,
        profilegroup: v.profilegroup,
        price_format: `Rp. ${Number(v.price || 0).toLocaleString('id-ID')}`,
        created_at_formatted: dayjs(v.created_at).format('D MMM YYYY'),
        owner_username: v.owner_username || '-',
        expired: v.expired ? dayjs(v.expired).format('D MMM YYYY') : 'Menunggu Login...',
        status: v.status,
      }));

      res.json({
        draw,
        recordsTotal: total,
        recordsFiltered: filtered,
        data
      });

    } catch (err) {
      console.error('Voucher API Error:', err.message);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data voucher.' });
    }
  }
}

module.exports = ApiVoucherController;
