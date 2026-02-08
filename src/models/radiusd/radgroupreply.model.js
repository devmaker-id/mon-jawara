const db = require("../../config/db");

class radgroupreplyModel {
    
    static async bulkCreate(groupname, attributes = []) {
        if (!attributes.length) return false;

        const values = attributes.map(attr => [
            groupname,
            attr.attribute,
            attr.op || ":=",
            attr.value
        ]);

        const sql = `
            INSERT INTO radgroupreply (groupname, attribute, op, value)
            VALUES ?
        `;

        const [result] = await db.query(sql, [values]);
        return result;
    }

    static async deleteByGroupname(groupname) {
        const sql = `DELETE FROM radgroupreply WHERE groupname = ?`;
        const [result] = await db.execute(sql, [groupname]);
        return result;
    }

}

module.exports = radgroupreplyModel;