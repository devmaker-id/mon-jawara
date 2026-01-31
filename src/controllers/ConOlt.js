const OltModel = require("../models/oltModel");
const TelegramModel = require("../models/telegramModel");
const VpnModel = require("../models/serverVpnModel");
const MikrotikModel = require("../models/mikrotikModel");
const ClientVpnModel = require("../models/akunVpnModel");
const RouterOSAPI = require("node-routeros").RouterOSAPI;

class ConOlt {

  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const user = req.session.user;
    const row = await OltModel.getByUserId(user.id);
    const mikrotik = await MikrotikModel.getByUserNoUsedOlt(user.id);
    
    res.render("olt/index", {
      title: "Olt Dashboard",
      mikrotik: mikrotik,
      dataOlt: row,
      flashData
    });
  }
  
  static async settings (req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const { userid, oltid } = req.params;
    
    if (!userid || !oltid) {
      req.session.flashData = {
        type: "danger",
        text: "Gagal mendapatkan data olt",
      };
      return res.redirect("/oltmgmn");
    }
    
    const olt = await OltModel.getOltidUserid(userid, oltid);
    if (!olt) {
      req.session.flashData = {
        type: "danger",
        text: "Gagal mendapatkan data olt DB",
      };
      return res.redirect("/oltmgmn");
    }
    const mikrotik = await MikrotikModel.getPublicAccess(olt.mikrotik_id);
    const oltpublic = `http://${mikrotik.host}:${mikrotik.public_port_webfig}`;
    
    const telegram = await TelegramModel.findByUserId(userid);
    res.render("olt/settings", {
      title: `Konfigurasi Olt ${olt.name}`,
      olt,
      telegram,
      flashData,
      oltpublic,
    });
  }
  
  static async joinOltToServer(req, res) {
    const { userid, oltid } = req.body;
    try {
      if (!userid || !oltid) {
        return res.json({
          success: false,
          msg: "data tidak lengkap"
        });
      }
      
      const olt = await OltModel.getOltidUserid(userid, oltid);
      if (!olt) {
        return res.json({
          success: false,
          msg: "Data OLT tidak ditemukan."
        });
      }
      
      //ambil akun vpn
      const akunVpn = await ClientVpnModel.getVpnId(olt.vpn_id);
      
      //ambil mikrotik client
      const clientMikrotik = await MikrotikModel.getById(olt.mikrotik_id);
      const mkClient = new RouterOSAPI({
        host: clientMikrotik.host,
        user: clientMikrotik.username,
        password: clientMikrotik.password,
        port: clientMikrotik.port_api,
        keepalive: true
      });
      await mkClient.connect();
      const ipLogSv = "172.10.0.254";
      const vpnGateway = akunVpn.gateway;
      
      // Tambah static route ke server log
      await mkClient.write('/ip/route/add', [
        `=dst-address=${ipLogSv}/32`,
        `=gateway=${vpnGateway}`,
        `=comment=static route jawara-vpn`
      ]);
      
      await mkClient.close();
      
      //konek ke server chr
      const chr = await VpnModel.getVpnServerByHost(akunVpn.server_host)
      
      const conn = new RouterOSAPI({
        host: chr.host,
        user: chr.username,
        password: chr.password,
        port: chr.port_api,
        keepalive: true
      });
      
      await conn.connect();
      const existingRoutes = await conn.write('/ip/route/print', [
        `?comment=${akunVpn.username}`
      ]);
      if (!existingRoutes) {
        //jika belum ada buat di server chr
        await conn.write('/ip/route/add', [
          `=dst-address=${olt.host}`,
          `=gateway=${akunVpn.ip_vpn}`,
          `=comment=${akunVpn.username}`
        ]);
      }
      //ping olt dari server chr
      const pingOlt = await conn.write('/ping', [
        `=address=${olt.host}`,
        '=count=1'
      ]);
      
      if (!pingOlt[0].size || !pingOlt[0].time || !pingOlt[0].ttl) {
        await conn.close();
        return res.json({
          success: false,
          msg: `gagal ping olt: ${olt.host}`
        });
      }
      
      //gunakan aksess publik ssh untuk telnet olt
      const natssh = await conn.write('/ip/firewall/nat/print', [
          `?comment=${akunVpn.username}_ssh`
        ]);
      //gunakan port webfig mikrotik untuk olt webfig
      const natwebfig = await conn.write('/ip/firewall/nat/print', [
          `?comment=${akunVpn.username}_webfig`
        ]);
      if (natssh.length > 0 && natssh[0]['to-ports'] !== String(olt.port) ) {
        await conn.write('/ip/firewall/nat/set', [
          `=.id=${natssh[0]['.id']}`,
          `=to-addresses=${olt.host}`,
          `=to-ports=${olt.port}`
        ]);
      }
      if (natwebfig.length > 0) {
        await conn.write('/ip/firewall/nat/set', [
          `=.id=${natwebfig[0]['.id']}`,
          `=to-addresses=${olt.host}`,
        ]);
      }
      
      await conn.close();
      
      const TelnetClient = require("../utils/telnetClient");
      const client = new TelnetClient({
        promptConsole: olt.promt_console,
        host: akunVpn.server_host,
        port: akunVpn.public_port_ssh,
        username: olt.username,
        password: olt.password,
      });
  
      await client.connect();
      await client.sendCommand("enable");
      const systemRaw = await client.sendCommand("show system");
      await client.sendCommand("quit");
      client.disconnect();
      
      const dataOlt = await client.parseSystemInfo(systemRaw);
      const oltUpdate = await OltModel.updateSnOlt(dataOlt.name, dataOlt.mac.toUpperCase(), dataOlt.sn, olt.id);
      
      if(!dataOlt || !oltUpdate.affectedRows) {
        return res.json({
          success: false,
          msg: "Gagal inisialisasi ke OLT"
        });
      }
      
      return res.json({
        success: true,
        msg: "OK!, OLT Terdeteksi",
        dataOlt
      });
    } catch (error) {
      console.error(error);
      return res.json({
        success: false,
        msg: error.message
      });
    }
  }
  
  static async tambahBaru(req, res) {
    const params = req.body;
    params.user_id = req.session.user.id;
    try {
    
    if (
      !params.name?.trim() ||
      !params.mikrotik?.trim() ||
      !params.host?.trim() ||
      !params.port?.trim() ||
      !params.username?.trim() ||
      !params.password?.trim()
    ) {
      req.session.flashData = {
        type: "danger",
        text: "Input data kurang lengkap",
      };
      return res.redirect("/oltmgmn");
    }
    
    const ip = params.host;
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) {
      req.session.flashData = {
        type: "danger",
        text: "Format IP tidak valid.",
      };
      return res.redirect("/oltmgmn");
    }
  
    const lastOctet = parseInt(ipParts[3]);
    if (lastOctet === 1 || lastOctet === 254 || lastOctet > 254) {
      // Saran IP: misalnya, ganti ke 2 atau 253
      ipParts[3] = lastOctet === 1 ? 2 : 253;
      const suggestedIp = ipParts.join(".");
  
      req.session.flashData = {
        type: "danger",
        text: `IP tidak boleh berakhiran ${lastOctet}. Gunakan IP lain, misalnya: ${suggestedIp}, jika tidak tersedia ganti dengan ip lain`,
        suggestedIp
      };
      return res.redirect("/oltmgmn");
    }
    
    const existOlt = await OltModel.getByHost(params.host);
    if(existOlt){
      const subnet = ip.split('.').slice(0, 3).join('.');
      const msg = `Kamu ga boleh pake ip ${ip} silahkan rubah, atau tetap di subneting yang sama ${subnet}.xxx`;
      req.session.flashData = {
        type: "danger",
        text: msg,
      };
      return res.redirect("/oltmgmn");
    }
    
    //update olt_used di tbl_mikrotik sesuai dengan name
    const updateMikrotik = await MikrotikModel.updateOltUsed(params.mikrotik, params.name);
    
      if (updateMikrotik.affectedRows === 0) {
        await MikrotikModel.updateOltUsed(params.mikrotik, null);
        throw new Error("Gagal update Mikrotik");
      }
      
      const rowOlt = await OltModel.insertData(params);
    
      if ( rowOlt.affectedRows === 0 ) {
        await MikrotikModel.updateOltUsed(params.mikrotik, null);
        throw new Error("Gagal insert olt");
      }
      
      req.session.flashData = {
        type: "success",
        text: "Berhasil tambah OLT",
      };
    } catch (error) {
      // Rollback update mikrotik jika error
      if (params.mikrotik) {
        await MikrotikModel.updateOltUsed(params.mikrotik, null);
      }
      req.session.flashData = {
        type: "danger",
        text: error.message || "Gagal tambah OLT",
      };
    }

    return res.redirect("/oltmgmn");
  }
  
  static async hapusOlt(req, res) {
    const { id } = req.body;
    const user = req.session.user;
    
    try {
      const olt = await OltModel.getById(id);
      
      if (!olt) {
        return res.status(404).json({
          success: false,
          msg: "OLT tidak ditemukan atau bukan milikmu",
        });
      }
      
      const result =  await MikrotikModel.updateOltUsed(olt.mikrotik_id, null);
      
      if ( result.affectedRows > 0 ) {
        await OltModel.deleteByIdAndUserId(id, user.id);
      }
     
      return res.status(200).json({
        success: true,
        msg: "OLT berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: error.message || "Gagal Hapus OLT",
      });
    }
  }

}

module.exports = ConOlt;
