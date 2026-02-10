const db = require("../../config/db");

class RadStationModel {
    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM tbl_rad_station`);
        return rows;
    }

    static async create(data) {
        const values = [
            data.name,              // nama sesuai server HOTSPOT / PPP
            data.service_type,      // hotspot, ppp default hotspot
            data.mikrotik_id,       // dari tbl_mikrotik.id
            data.mikrotik_name      // dari tbl_mikrotik.name
        ];

        const sql = `INSERT INTO tbl_rad_station (name, service_type, mikrotik_id, mikrotik_name, created_at)
            VALUES (?, ?, ?, ?, NOW() )`;
        const rows = await db.query(sql, values);
        return rows;
    }
}

module.exports = RadStationModel;