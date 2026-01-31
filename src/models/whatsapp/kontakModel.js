const { resolveInclude } = require("ejs");
const db = require("../../config/db");

class WaKontakModel {

    static async getAll() {
        try {
            const sql = `SELECT * FROM tbl_wa_kontak ORDER BY id DESC`;
            const [results] = await db.query(sql);
            return results;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    static async getJid(jid) {
        try {
            const sql = `SELECT * FROM tbl_wa_kontak WHERE jid = ? LIMIT 1`;
            const [results] = await db.query(sql, [jid]);
            return results[0] || null;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    static async getId(id) {
        try {
            const sql = `SELECT * FROM tbl_wa_kontak WHERE id = ? LIMIT 1`;
            const [results] = await db.query(sql, [id]);
            return results[0] || null;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    }

    static async create(jid, name) {
        try {
        const sql = `INSERT INTO tbl_wa_kontak (jid, name) VALUES (?, ?)`;
        await db.query(sql, [jid, name]);
        return true;
        } catch (error) {
        console.error(error.message);
        throw error;
        }
    }

    static async update(id, jid, name) {
        const sql = `UPDATE tbl_wa_kontak SET jid = ?, name = ? WHERE id = ?`;
        const [result] = await db.query(sql, [jid, name, id]);
        return result;
    }

    static async delete(id) {
        const sql = `DELETE FROM tbl_wa_kontak WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        return result;
    }


}

module.exports = WaKontakModel