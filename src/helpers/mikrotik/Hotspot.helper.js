// helpers/mikrotik/Hotspot.helper.js
class HotspotHelper {
    static async createProfile(conn, name, iplocal) {
        return conn.write("/ip/hotspot/profile/add", [
            `=name=${name}`,
            `=dns-name=${iplocal}`,
            `=hotspot-address=${iplocal}`
        ]);
    }
}

module.exports = HotspotHelper;