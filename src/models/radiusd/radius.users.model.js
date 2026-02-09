const db = require("../../config/db");

class radiusUsers {

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM tbl_radius_users`);
        return rows;
    }

    static async create(data) {
        const sql = `INSERT INTO tbl_radius_users (
            username,
            password,
            service_type,
            user_type,
            profilegroup,
            time_quota,
            time_used,
            first_login_at,
            expired_at,
            status,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?, NOW())`;
        const values = [
            data.username,
            data.password,
            data.service_type,          // hotspot | pppoe | vpn
            data.user_type,             // voucher | customer | admin
            data.profilegroup,          // nama dari radusergroup
            data.time_quota ?? null,    // boleh NULL (unlimited)
            data.status ?? 'active'     // active | expired | disabled
        ];
        const [result] = await db.query(sql, values);
        return result.insertId;
    }

}

module.exports = radiusUsers;