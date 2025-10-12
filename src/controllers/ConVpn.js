const OltModel = require("../models/oltModel");
const VpnModel = require("../models/akunVpnModel");
const ServerVpn = require("../models/serverVpnModel");
const PortModel = require("../models/portModel");
const VpnLimitModel = require("../models/limitakunvpnModel");

class ConOlt {

  static async index(req, res) {
    const vpn = require("../models/serverVpnModel");
    const allServer = await vpn.getAll();
    
    //console.log(allServer);
    
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const user = req.session.user;
    
    const limitAt = await VpnLimitModel.getLimit(user.id);
    //console.log(limitAt);
    
    //console.log(row);
    //get akun vpn by user_id
    const akunVpn = await VpnModel.getById(user.id);
    //console.log("Akun Vpn by user_id\n", akunVpn);
    
    res.render("vpn/index", {
        title: "Akun Vpn Manajemen",
        data: akunVpn,
        serverVpn: allServer,
        stats: {
          totalAkun: limitAt.limit,
          limitAkun: limitAt.used
        },
        flashData
      });
  }
  
  static async getType(req, res) {
    try {
      const id = req.params.id;
      const vpnTypes = await ServerVpn.getVpnType(id);
      res.json(vpnTypes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  
  static async createVpn(req, res) {
    try {
      const crypto = require("crypto");
      const body = req.body;
      
      const user = req.session.user;
      const vpnlimit = await VpnLimitModel.getLimit(user.id);
      
      if (vpnlimit.used >= vpnlimit.limit) {
        req.session.flashData = {
          type: "danger",
          text: "Limit akun vpn sudah habis",
        };
        return res.redirect("/vpn");
      }
      
      //ready server vpn
      const VpnSv = await ServerVpn.getServerVpnDetail(body.vpn, body.service);
      if(!VpnSv) {
        req.session.flashData = {
          type: "danger",
          text: "Server vpn tidak ada/offline",
        };
        return res.redirect("/vpn");
      }
      
      const username = crypto.randomBytes(3).toString("hex") + "@jawara.net";
      const password = crypto.randomBytes(4).toString("hex");
      
      const ip = await ServerVpn.createIp('vpn-server');
      
      //buat port dinamis
      const allocatedPorts = await PortModel.creatPortAllServices();
      
      // Pastikan data port yang dialokasikan tersedia
      if (!allocatedPorts.ssh || !allocatedPorts.winbox || !allocatedPorts.webfig || !allocatedPorts.api) {
        req.session.flashData = {
          type: "danger",
          text: "Port dinamis tidak tersedia untuk beberapa layanan",
        };
        return res.redirect("/vpn");
      }

      const params = {
        user_id: user.id,
        name: VpnSv.server_name,
        host: VpnSv.server_host,
        type: VpnSv.vpn_type_name,
        port: VpnSv.port,
        port_winbox: allocatedPorts.winbox.port,
        port_webfig: allocatedPorts.webfig.port,
        port_ssh: allocatedPorts.ssh.port,
        port_api: allocatedPorts.api.port,
        username,
        password,
        gateway: ip.address,
        ip_vpn: ip.pool
      }
      
      //buat akun vpn ke chr
      const rows = await ServerVpn.createVpnToChr(params);
      
      if (!rows.success) {
        req.session.flashData = {
          type: "danger",
          text: rows.error,
        };
        return res.redirect("/vpn");
      }
      
      //console.log('CREATE VPN\n', rows);
      const row = await VpnModel.createVpn(params, rows.ret);
      //console.log('DB VPN\n', row);
      
      if(!row.affectedRows) {
        req.session.flashData = {
          type: "danger",
          text: "Gagal membuat akun vpn",
        };
        return res.redirect("/vpn");
      }
      const newused = vpnlimit.used + 1;
      await VpnLimitModel.updateUsedByUserId(user.id, newused);
      req.session.flashData = {
        type: "success",
        text: "Berhasil buat akun vpn",
      };
      return res.redirect("/vpn");
    } catch (error) {
      req.session.flashData = {
        type: "danger",
        text: error.message || "Terjadi kesalahan saat membuat akun vpn",
      };
      return res.redirect("/vpn");
    }
  }
  
  static async deleteAkun(req, res) {
    try {
      const akunId = req.params.id;
      const userId = req.session.user.id;
      
      const limitvpn = await VpnLimitModel.getLimit(userId);
      const newused = limitvpn.used - 1;
      
      //apakah vpn sudah digunakan
      const akunVpn = await VpnModel.getVpnId(akunId);
      if (akunVpn.used_mikrotik) {
        req.session.flashData = {
          type: "warning",
          text: `${akunVpn.username}, ga boleh dihapus!!! karna dipakai mikrotik, ${akunVpn.used_mikrotik}`,
        };
        return res.redirect("/vpn");
      }
      
      const rows = await ServerVpn.deleteVpnChr(akunId);
      //console.log(rows);
      if(!rows.success) {
        req.session.flashData = {
          type: "danger",
          text: "Gagal menghapus vpn.",
        };
        return res.redirect("/vpn");
      }
  
      const result = await VpnModel.deleteAkun(akunId, userId);
      
      //console.log('out\n', result);
  
      if (result.affectedRows > 0) {
        await VpnLimitModel.updateUsedByUserId(userId, newused);
        req.session.flashData = {
          type: "success",
          text: "Akun VPN berhasil dihapus.",
        };
      } else {
        req.session.flashData = {
          type: "warning",
          text: "Akun tidak ditemukan atau kamu tidak memiliki akses.",
        };
      }
  
      return res.redirect("/vpn");
    } catch (error) {
      req.session.flashData = {
        type: "danger",
        text: error.message,
      };
      return res.redirect("/vpn");
    }
  }

}

module.exports = ConOlt;