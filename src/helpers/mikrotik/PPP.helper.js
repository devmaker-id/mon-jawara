// helpers/mikrotik/PPP.helper.js
class PPPHelper {

    static async findProfileByComment(conn, comment) {
        const res = await conn.write("/ppp/profile/print", [
            `?comment=${comment}`
        ]);

        return res && res.length > 0 ? res[0] : null;
    }

    static async createProfile(conn, name, localIp, poolName, dns, comment) {
        return conn.write("/ppp/profile/add", [
            `=name=${name}`,
            `=local-address=${localIp}`,
            `=remote-address=${poolName}`,
            `=dns-server=${dns}`,
            `=comment=${comment}`
        ]);
    }

    static async updateProfile(conn, id, name, localIp, poolName, dns, comment) {
        return conn.write("/ppp/profile/set", [
            `=.id=${id}`,
            `=name=${name}`,
            `=local-address=${localIp}`,
            `=remote-address=${poolName}`,
            `=dns-server=${dns}`,
            `=comment=${comment}`
        ]);
    }

    static async createOrUpdateByComment(conn, name, localIp, poolName, dns, comment) {
        const existing = await this.findProfileByComment(conn, comment);

        if (existing) {
            return this.updateProfile(
                conn,
                existing['.id'],
                name,
                localIp,
                poolName,
                dns,
                comment
            );
        }

        return this.createProfile(conn, name, localIp, poolName, dns, comment);
    }
}

module.exports = PPPHelper;
