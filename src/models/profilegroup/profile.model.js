const db = require("../../config/db");

class ProfileModelGroup {

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM tbl_profile_model`);
        return rows;
    }

    static async getByName(name) {
        const sql = `SELECT name FROM tbl_profile_model WHERE name = ?`;
        const [rows] = await db.query(sql, [name]);
        return rows ? rows[0] : null;
    }

    static async create(data) {
        const {
            name,
            nas_id,
            nasname,
            owner_id,
            owner_name,
            service_type,
            module_ip,
            local_ip,
            start_ip,
            end_ip,
            dns
        } = data;

        const query = `
            INSERT INTO tbl_profile_model
            (
                name,
                nas_id,
                nasname,
                owner_id,
                owner_name,
                service_type,
                module_ip,
                local_ip,
                start_ip,
                end_ip,
                dns,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const values = [
            name,
            nas_id,
            nasname,
            owner_id,
            owner_name,
            service_type,
            module_ip,
            local_ip || null,
            start_ip || null,
            end_ip || null,
            dns || "8.8.8.8,8.8.4.4"
        ];

        const [result] = await db.query(query, values);
        return result.insertId;
    }

}

module.exports = ProfileModelGroup;