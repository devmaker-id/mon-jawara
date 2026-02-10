const RouterOSAPI = require("node-routeros").RouterOSAPI;
const MikrotikModel = require("../../models/mikrotikModel");
const NasModel = require("../../models/radiusd/nasModel");
const RadServer = require("../../models/radiusd/radServerUserModel");
const RadiusModel = require("../../models/radiusd/radServerModel");
const RadStation = require("../../models/radiusd/rad.station.model");
const RadDomain = require("../../models/radiusd/rad.domain.model");

class NasController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const nasClients = await NasModel.findAll();
    const mkclient = await MikrotikModel.getByUserNoUsedNas(req.user.id);

    // console.log('mikrotik client', mkclient);

    const radPort = await RadServer.getServersByUserId(req.user.id);
    const radServer = await RadServer.getAll();
    
    //console.log("Nas:\n", nasClients);

    res.render("nas-client/index", {
      title: "Nas Client Manajemen",
      nasClients,
      mkclient,
      radPort,
      radServer,
      flashData
    });
  }

  static async nasStation(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    res.render("nas-client/nas-station", {
      title: "manajement station nas",
      flashData
    });
  }

  static async nasDomain(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    res.render("nas-client/nas-domain", {
      title: "manajement station domain",
      flashData
    });
  }

  static async getHostMikrotik(req, res) {
    const { id } = req.params;
    const user = req.session.user;
    try {

      const nas = await NasModel.getById(id);
      if (!nas) {
        return res.json({
          success: false,
          message: "Nas Tidak Ditemukan"
        });
      }

      const mikrotik = await MikrotikModel.getAllHostByUserId(user.id);
      return res.json({
        success: true,
        mikrotik,
        nas
      });

    } catch (err) {
      console.error(err.message);
      throw err;
    }
  }
  
  static async buatRadiusClient(req, res) {
    const COMMENT = "added by mon-jawara";

    const {
      name,
      svradius,
      mikrotik,
      deskripsi,
      secret
    } = req.body;

    // ===============================
    // 1️⃣ VALIDASI INPUT
    // ===============================
    if (!name || !svradius || !mikrotik || !deskripsi || !secret) {
      return res.json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    const rdSv = await RadiusModel.getById(svradius);
    if (!rdSv) {
      return res.json({
        success: false,
        message: 'Ga ada radius server yang cocok'
      });
    }

    const radIp = rdSv.host;
    const pauth = rdSv.port_auth;
    const pacct = rdSv.port_acct;

    try {
      // ===============================
      // 2️⃣ AMBIL DATA MIKROTIK
      // ===============================
      const mkData = await MikrotikModel.getById(mikrotik);
      if (!mkData) {
        return res.json({
          success: false,
          message: 'Mikrotik tidak ditemukan'
        });
      }

      // ===============================
      // 3️⃣ INSERT DB DULU (AMAN)
      // ===============================
      const nasData = {
        nasname: mkData.host,
        shortname: name,
        type: 'other',
        secret: secret,
        description: deskripsi,
        status: 'online'
      };

      await NasModel.createNas(nasData);

      // update relasi mikrotik
      await MikrotikModel.updateNasUsed(mkData.id, name);

      // ===============================
      // 4️⃣ BARU KONEK KE MIKROTIK
      // ===============================
      const conn = new RouterOSAPI({
        host: mkData.host,
        user: mkData.username,
        password: mkData.password,
        port: mkData.port_api,
        timeout: 5_000 // ⏱️ penting!
      });

      const radius = require('../../helpers/radius.helper');
      const hotspot = require('../../helpers/hotspot.helper');

      try {
        await conn.connect();

        await radius.removeRadiusByComment(conn, COMMENT);

        await radius.addRadius(conn, {
          address: radIp,
          secret,
          authPort: pauth,
          acctPort: pacct,
          comment: COMMENT
        });

        await radius.enableIncomingRadius(conn);
        await hotspot.enableHotspotRadius(conn);
        await hotspot.enablePPPRadius(conn);

        res.json({
          success: true,
          message: 'Radius client berhasil dibuat'
        });

      } catch (err) {
        console.error(err);

        res.json({
          success: false,
          message: 'DB tersimpan, namun konfigurasi Mikrotik gagal'
        });

      } finally {
        await conn.close().catch(() => {});
      }

    } catch (err) {
      console.error('Server error:', err);
      res.json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async deleteNas(req, res) {
    const { id } = req.params;

    try {
      const nas = await NasModel.getById(id);
      if (!nas) return res.json({ success: false, message: 'NAS tidak ditemukan.' });
      
      const mikrotik = await MikrotikModel.getByUsedNas(nas.shortname);
      if (!mikrotik) return res.json({ success: false, message: 'Mikrotik tidak ditemukan.' });
  
      const conn = new RouterOSAPI({
        host: mikrotik.host,
        user: mikrotik.username,
        password: mikrotik.password,
        port: mikrotik.port_api,
      });
  
      await conn.connect();
      
      // 🔸 Hapus radius client dari Mikrotik
      const radiusList = await conn.write('/radius/print');
      for (const item of radiusList) {
        if (item.comment === 'added by mon-jawara') {
          await conn.write('/radius/remove', [`=.id=${item['.id']}`]);
        }
      }
  
      // 🔸 Nonaktifkan use-radius di semua hotspot profile
      const hotspotProfiles = await conn.write('/ip/hotspot/profile/print');
      const hotspotSetPromises = hotspotProfiles.map(profile =>
        conn.write('/ip/hotspot/profile/set', [
          `=.id=${profile['.id']}`,
          '=use-radius=no'
        ])
      );
      await Promise.all(hotspotSetPromises);
      
      // 🔸 Nonaktifkan use-radius di ppp
      await conn.write('/ppp/aaa/set', [
        '=use-radius=no',
        '=accounting=no'
      ]);
  
      await conn.close();
  
      // 🔸 Update mikrotik: used_rad => NULL
      await MikrotikModel.updateNasUsed(mikrotik.id);
  
      // 🔸 Hapus NAS dari database
      const deleted = await NasModel.deleteNas(id);
      if (deleted) {
        return res.json({ success: true, message: 'NAS berhasil dihapus.' });
      } else {
        return res.json({ success: false, message: 'NAS tidak ditemukan atau gagal dihapus.' });
      }
    } catch (error) {
      console.error('❌ Gagal menghapus NAS:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
  }

  static async editNas(req, res) {
    const { id } = req.params;
    const data = req.body;

    const params = {
      description: data.description || null,
      nasname: data.nasname,
      secret: data.secret,
      shortname: data.shortname,
    }

    const respon = await NasModel.editNas(id, params);
    if ( !respon ) {
      return res.json({
        success: false,
        message: "Gagal edit nas"
      });
    }

    return res.json({
      success: true,
      message: "Nas berhasil di update"
    });
  }
  
}

module.exports = NasController;