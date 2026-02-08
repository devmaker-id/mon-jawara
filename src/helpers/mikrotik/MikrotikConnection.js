// helpers/mikrotik/MikrotikConnection.js
const { RouterOSAPI } = require("node-routeros");

class MikrotikConnection {
    static async connect(mk) {
        const conn = new RouterOSAPI({
            host: mk.host,
            user: mk.user,
            password: mk.password,
            port: mk.port || 8728,
            timeout: 5
        });

        await conn.connect();

        // detect ROS version (optional, tapi kepake)
        const [resource] = await conn.write("/system/resource/print");
        const version = resource.version.startsWith("7") ? "v7" : "v6";

        return { conn, version };
    }
}

module.exports = MikrotikConnection;