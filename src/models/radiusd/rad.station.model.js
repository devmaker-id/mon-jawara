const db = require("../../config/db");

class RadStationModel {
    static async getAll() {
        const [rows] = await db.query(`SELECT * FROM tbl_rad_station`);
        return rows;
    }
}

module.exports = RadStationModel;