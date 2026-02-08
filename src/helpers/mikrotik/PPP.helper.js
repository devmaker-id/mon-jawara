// helpers/mikrotik/PPP.helper.js
class PPPHelper {
    static async createProfile(conn, name, localIp, poolName, dns) {
        return conn.write("/ppp/profile/add", [
            `=name=${name}`,
            `=local-address=${localIp}`,
            `=remote-address=${poolName}`,
            `=dns-server=${dns}`
        ]);
    }
}

module.exports = PPPHelper;