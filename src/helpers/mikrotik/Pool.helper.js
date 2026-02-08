// helpers/mikrotik/Pool.helper.js
class PoolHelper {
    static async create(conn, name, startIp, endIp, comment) {
        return conn.write("/ip/pool/add", [
            `=name=${name}`,
            `=ranges=${startIp}-${endIp}`,
            `=comment=${comment}`
        ]);
    }
}

module.exports = PoolHelper;