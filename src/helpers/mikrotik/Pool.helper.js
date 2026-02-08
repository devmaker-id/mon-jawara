// helpers/mikrotik/Pool.helper.js
class PoolHelper {
    static async findByComment(conn, comment) {
        const res = await conn.write("/ip/pool/print", [
            `?comment=${comment}`
        ]);

        return res && res.length > 0 ? res[0] : null;
    }
    static async findByName(conn, name) {
        const res = await conn.write("/ip/pool/print", [
            `?name=${name}`
        ]);

        return res && res.length > 0 ? res[0] : null;
    }
    static async create(conn, name, startIp, endIp, comment) {
        return conn.write("/ip/pool/add", [
            `=name=${name}`,
            `=ranges=${startIp}-${endIp}`,
            `=comment=${comment}`
        ]);
    }
    static async deleteByName(conn, name) {
        const data = await this.findByName(conn, name);
        if (!data) return false;

        await conn.write("/ip/pool/remove", [
            `=.id=${data['.id']}`
        ]);

        return true;
    }
}

module.exports = PoolHelper;