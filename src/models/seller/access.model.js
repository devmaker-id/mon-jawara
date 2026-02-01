const db = require("../../config/db");

class AccessModel {

    static async getAll() {
        try {
            // const sql = `SELECT 
            //     sa.id,
            //     sa.resource_type,
            //     sa.resource_id,
            //     sa.status,
            //     sa.assigned_at,
            //     s.name AS seller_name
            //     FROM tbl_seller_access sa
            //     JOIN tbl_sellers s ON sa.seller_id = s.seller_id
            //     ORDER BY sa.assigned_at DESC
            // `;
            const sql = `SELECT * FROM tbl_seller_access`;
            const [rows] = await db.query(sql);
            return rows;
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    static async getAvailableSellers() {
        // const sql = `
        //     SELECT s.seller_id, s.name
        //     FROM tbl_sellers s
        //     LEFT JOIN tbl_seller_access sa 
        //     ON sa.seller_id = s.seller_id
        //     WHERE sa.seller_id IS NULL
        //     ORDER BY s.name ASC
        // `;
        const sql = `SELECT * FROM tbl_sellers`;
        const [rows] = await db.query(sql);
        return rows;
    }


}

module.exports = AccessModel;