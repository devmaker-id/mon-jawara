const OltModel = require("../models/oltModel");
const VpnModel = require("../models/akunVpnModel");
const ServerModel = require("../models/serverVpnModel");
const MikrotikModel = require("../models/mikrotikModel");
const RouterOSAPI = require("node-routeros").RouterOSAPI;

class ConMikrotik {
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const user = req.session.user;
    const mikrotik = await MikrotikModel.getByUser(user.id);
    const vpnAkun = await VpnModel.getByIdNoUsed(user.id);

    //console.log('MIKROTIK\n', mikrotik);
    //console.log("vpn akun\n", vpnAkun);

    res.render("mikrotik/index", {
      title: "Mikrotik Dashboard",
      mikrotik: mikrotik,
      vpnAkun: vpnAkun,
      flashData,
    });
  }

  static async generateScriptVpn(req, res) {
    try {
      const { vpnId, ros, portApi } = req.body;

      if (!vpnId || !ros || !portApi) {
        req.session.flashData = {
          type: "danger",
          text: "Cek kembali form yang harus di ini",
        };
        return res.redirect("/mikrotik");
      }

      //ambil detail vpn dengan id
      const akunVpn = await VpnModel.getVpnId(vpnId);
      //console.log("AKUN VPN\n", akunVpn);

      //buat user aksess api mikrotik
      const mikrotikUser = `jawara${Math.floor(
        100000 + Math.random() * 900000
      )}`;
      const mikrotikPass = require("crypto").randomBytes(12).toString("base64").replace(/[+/=]/g, "");

      const { buildVpnScript } = require("../helpers/vpnScriptBuilder");
      
      const script = buildVpnScript({
        vpnType: akunVpn.type_vpn,
        rosVersion: ros,
        vpnHost: akunVpn.server_host,
        vpnPort: akunVpn.port_vpn,
        username: akunVpn.username,
        password: akunVpn.password,
        ipaddr: akunVpn.ip_vpn,
        mikrotikUser: mikrotikUser,
        mikrotikUserPass: mikrotikPass,
      });

      return res.status(200).json({
        success: true,
        message: "Script berhasil dibuat",
        script: script,
        usermk: mikrotikUser,
        passmk: mikrotikPass
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Terjadi kesalahan di server" });
    }
  }
  
  static async deleteScriptVpn(req, res) {
    try {
      const { vpnid } = req.body;
      const user = req.session.user;

      if (!vpnid) {
        req.session.flashData = {
          type: "danger",
          text: "Cek kembali form yang harus di ini",
        };
        return res.redirect("/mikrotik");
      }
      const mikrotik = await MikrotikModel.getByUserVpnid(user.id, vpnid);
      
      if (!mikrotik) {
        req.session.flashData = {
          type: "danger",
          text: "Gagal mencari data mikrotik",
        };
        return res.redirect("/mikrotik");
      }
      
      const mk = mikrotik[0];

      if (mk.olt_used !== null && mk.olt_used !== undefined && mk.olt_used !== '') {
        return res.status(403).json({
          title: `Peringatan`,
          msg: `Mikrotik ga boleh dihapus, sedang digunakn OLT ${mk.olt_used}`,
          icon: `info`
        });
      }
      
      const { buildVpnCleanupScript } = require("../helpers/vpnScriptBuilder");
      const script = buildVpnCleanupScript({
        rosVersion: mk.ros
      });
      
      //jika mikrotik client bisa di ping dari server gagalkan penghapusan
      const chr = await ServerModel.getVpnServerByHost(mk.host);
      const vpnClient = await VpnModel.getVpnId(mk.vpn_id);
  
      const conn = new RouterOSAPI({
        host: chr.host,
        user: chr.username,
        password: chr.password,
        port: chr.port_api,
        keepalive: true
      });
      await conn.connect();
      const pingVpn = await conn.write('/ping', [
        `=address=${vpnClient.ip_vpn}`,
        '=count=3'
      ]);
      
      if (pingVpn.length > 0 && pingVpn[2] && (pingVpn[2].ttl || pingVpn[2].time)) {
        await conn.close();
        return res.json({
          success: false,
          msg: `Silahkan jalankan script dahulu di mikrotik kamu, copy paste script di bawah, jika sudah selesai klik kembali tombol hapus ini.`,
          script: script
        });
      }
      await conn.close();
      
      const dlt = await MikrotikModel.deleteMikrotikClient(mk.id, mk.vpn_id);
      if (dlt.success) {
        return res.status(200).json({
          success: true,
          msg: dlt.msg
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Terjadi kesalahan di server" });
    }
  }
  
  static async pingClientVpn(req, res) {
    try {
      const { vpnId, user_mk, pass_mk, api_port } = req.body;
      if ( !vpnId || !user_mk || !pass_mk || !api_port ) {
        req.session.flashData = {
          type: "danger",
          text: "Gagal mendapatkan akun vpn",
        };
        return res.redirect("/mikrotik");
      }
      
      const akunVpn = await VpnModel.getVpnId(vpnId);
      //console.log("AKUN VPN\n", akunVpn);
      
      const host = akunVpn.server_host;
      const userVpn = akunVpn.username;
      const ipVpn = akunVpn.ip_vpn;
      
      if (api_port !== '8728') {
        //change fort api ke firewall nat
        const comment = `${userVpn}_api`;
        const fwNat = await ServerModel.changeApiPort(host, comment, api_port);
        if(!fwNat.success) {
          return res.status(404).json({
            success: false,
            msg: fwNat.msg
          });
        }
      }
      
      const clientVpn = await ServerModel.getIdentityMikrotik(host, user_mk, pass_mk, akunVpn.public_port_api);
      
      if (Array.isArray(clientVpn) && clientVpn.length > 0) {
        return res.status(200).json({
          success: true,
          msg: `Ok!, Identity: ${clientVpn[0].name}`,
        });
      } else {
        return res.status(200).json({
          success: false,
          msg: "Mikrotik anda ga konek, cek port api, koneksi vpn.",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Terjadi kesalahan di server" });
    }
  }
  
  static async saveMikrotikVpn(req, res) {
    try {
      const {
        namemikrotik,
        vpn,
        ros,
        usernameMk,
        passwordMk
      } = req.body;
      
      const akunVpn = await VpnModel.getVpnId(vpn);
      
      const params = {
        user_id: req.session.user.id,
        vpn_id: vpn,
        name: namemikrotik,
        ros: ros,
        host: akunVpn.server_host,
        port_api: akunVpn.public_port_api,
        username: usernameMk,
        password: passwordMk
      }

      const result = await MikrotikModel.inputData(params);
      if(result.affectedRows > 0) {
        req.session.flashData = {
          type: "success",
          text: `Berhasil menambah mikrotik ${namemikrotik}`,
        };
      } else {
        req.session.flashData = {
          type: "danger",
          text: `gagal simpan mikrotik ${namemikrotik}`,
        };
      }
      return res.redirect("/mikrotik");
    } catch (error) {
      req.session.flashData = {
        type: "danger",
        text: error.message,
      };
      return res.redirect("/mikrotik");
    }
  }
  
  static async infoAksesPublic(req, res) {
    const { vpnid } = req.body;
    const userid = req.session.user.id;
    
    try {
      if (!vpnid || !userid) {
        return res.status(403).json({
          success: false,
          msg: `Gagal mengambil data Input`
        });
      }
      const remote = await VpnModel.getPublicAccess(vpnid, userid);
      if (!remote){
        return res.status(403).json({
          success: false,
          msg: `Gagal mengambil data DB`
        });
      }
      
      const data = {
        winbox: `${remote.server_host}:${remote.public_port_winbox} <-> ${remote.ip_vpn}:8291`,
        web: `${remote.server_host}:${remote.public_port_webfig} <-> ${remote.ip_vpn}:80`,
        ssh: `${remote.server_host}:${remote.public_port_ssh} <-> ${remote.ip_vpn}:22`,
        api: `${remote.server_host}:${remote.public_port_api} <-> ${remote.ip_vpn}:8728`,
      };
      
      return res.status(200).json({
        success: true,
        data: data
      });
    } catch (error) {
      return res.status(error).json({
        success: false,
        msg: error.message
      });
    }
  }
  
}

module.exports = ConMikrotik;
