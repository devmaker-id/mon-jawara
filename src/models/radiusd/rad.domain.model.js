const db = require("../../config/db");

class RadDomainModel {
    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM tbl_rad_domain`);
        return rows;
    }
}

module.exports = RadDomainModel;