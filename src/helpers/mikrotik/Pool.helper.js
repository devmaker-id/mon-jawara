// helpers/mikrotik/Pool.helper.js
class PoolHelper {
    static async create(conn, name, startIp, endIp) {
        return conn.write("/ip/pool/add", [
            `=name=${name}`,
            `=ranges=${startIp}-${endIp}`
        ]);
    }
}

module.exports = PoolHelper;