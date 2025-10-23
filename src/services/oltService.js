// src/services/oltService.js
const TelnetClient = require("../utils/olt/telnetHisfocus");

class OltService {
  static async getOnuDetail(onu, oltConfig = null) {
    const client = new TelnetClient({
      host: oltConfig?.host || process.env.OLT_HOST,
      port: oltConfig?.port || process.env.OLT_PORT,
      username: oltConfig?.username || process.env.OLT_USER,
      password: oltConfig?.password || process.env.OLT_PASS,
      promptConsole: oltConfig?.prompt || "OLT_JAWARA"
    });

    try {
      const connectResult = await client.connect();
      if (!connectResult.success) return connectResult;
      
      // contoh: ambil optical info
      await client.sendCommand(`enable`);
      
      const rawResponse = await client.sendCommand(`show onu info epon ${onu.epon_port} ${onu.onu_id}`);
      const onuInfoRaw = await client.sendCommand(`show onu optical-ddm epon ${onu.epon_port} ${onu.onu_id}`);
      
      //console.log("raw:\n", onuInfoRaw.data);
      
      client.disconnect();

      return {
        success: true,
        message: "OK",
        data: {
          onu_info: {...rawResponse.data, ...onuInfoRaw.data }
        },
      };
    } catch (error) {
      console.error("OLT Service Error:", error);
      client.disconnect();
      return {
        success: false,
        message: "OLT_ERROR",
        data: error.message,
      };
    }
  }
}

module.exports = OltService;
