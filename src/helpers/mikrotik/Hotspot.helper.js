// helpers/mikrotik/Hotspot.helper.js
class HotspotHelper {
    static async createProfile(conn, name, iplocal) {
        return conn.write("/ip/hotspot/profile/add", [
            `=name=${name}`,
            `=dns-name=${iplocal}`,
            `=hotspot-address=${iplocal}`
        ]);
    }
    static async findByName(conn, name) {
        const res = await conn.write("/ip/hotspot/profile/print", [
            `?name=${name}`
        ]);

        return res && res.length > 0 ? res[0] : null;
    }

    static async deleteByName(conn, name) {
        const data = await this.findByName(conn, name);
        if (!data) return false;

        await conn.write("/ip/hotspot/profile/remove", [
            `=.id=${data['.id']}`
        ]);

        return true;
    }
}

module.exports = HotspotHelper;