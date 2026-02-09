const db = require("../../config/db");

class radiusUsers {

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM tbl_radius_users`);
        return rows;
    }

}

module.exports = radiusUsers;