const db = require("../../config/db");

class ProfileModelGroup {

    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM tbl_profile_model`);
        return rows;
    }

}

module.exports = ProfileModelGroup;