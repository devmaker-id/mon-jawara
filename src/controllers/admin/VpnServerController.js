const ServerVpn = require("../../models/serverVpnModel");
const LimitVpnModel = require("../../models/limitakunvpnModel");
const TypeVpnModel = require("../../models/typeVpnModel");

class VpnServerController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const vpnServers = await ServerVpn.getAll();
      
    res.render("vpn-server/index", {
      title: "Manajemen Server VPN",
      vpnServers,
      flashData
    });
  }
  
  static async vpntype(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const vpnTypes = await TypeVpnModel.getAll();
      
    res.render("vpn-server/vpn-type", {
      title: "Vpn Type",
      vpnTypes,
      flashData
    });
  }
  
  static async vpngroup(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const servers = [
      { id: 1, name: 'CHR Jakarta' },
      { id: 2, name: 'CHR Bandung' }
    ];
  
    const vpnTypes = [
      { name: 'ovpn', description: 'OpenVPN' },
      { name: 'sstp', description: 'SSTP' },
      { name: 'l2tp', description: 'L2TP' }
    ];
  
    const groupings = [
      { server_id: 1, type: 'ovpn' },
      { server_id: 1, type: 'l2tp' },
      { server_id: 2, type: 'sstp' },
      { server_id: 2, type: 'ovpn' }
    ];
      
    res.render("vpn-server/vpn-group", {
      title: "Vpn Group Server",
      servers,
      vpnTypes,
      groupings,
      flashData
    });
  }
  
  static async vpnRouting(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
      
    res.render("vpn-server/routing", {
      title: "Routing Server VPN",
      flashData
    });
  }
  
  static async vpnFirewall(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
      
    res.render("vpn-server/firewall", {
      title: "Firewall Server VPN",
      flashData
    });
  }
  
  static async vpnLimit(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const limits = await LimitVpnModel.getAllData();
    console.log(limits);
      
    res.render("vpn-server/limit-vpn", {
      title: "Limitasi Akun Vpn",
      limits,
      flashData
    });
  }
  
  static async updateLimitAkun(req, res) {
    try {
      const { id, limit } = req.body;
      const current = await LimitVpnModel.getById(id);
  
      if (!current) return res.json({ success: false, message: "Data tidak ditemukan" });
      if (parseInt(limit) < parseInt(current.used)) {
        return res.json({ success: false, message: "Limit tidak boleh lebih kecil dari jumlah akun yang digunakan." });
      }
  
      await LimitVpnModel.updateLimitById(id, limit);
      return res.json({ success: true, message: "Limit berhasil diperbarui" });
    } catch (err) {
      console.error(err);
      return res.json({ success: false, message: "Terjadi kesalahan server." });
    }
  }

  
}

module.exports = VpnServerController;