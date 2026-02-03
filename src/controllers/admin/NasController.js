const RouterOSAPI = require("node-routeros").RouterOSAPI;
const MikrotikModel = require("../../models/mikrotikModel");
const NasModel = require("../../models/radiusd/nasModel");
const RadServer = require("../../models/radiusd/radServerUserModel");
const AkunVpnModel = require("../../models/akunVpnModel");

class NasController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const nasClients = await NasModel.findAll();
    const mkclient = await MikrotikModel.getByUserNoUsedNas(req.user.id);

    // console.log('mikrotik client', mkclient);

    const radPort = await RadServer.getServersByUserId(req.user.id);
    
    //console.log("Nas:\n", nasClients);

    res.render("nas-client/index", {
      title: "Nas Client Manajemen",
      nasClients,
      mkclient,
      radPort,
      flashData
    });
  }

  static async buatRadiusClient(req, res) {
    const radIp = "172.10.0.253";
    const SECRET = "Jawara1234";
    const COMMENT = "added by mon-jawara";

    const {
      name,
      pauth,
      pacct,
      mikrotik,
      deskripsi
    } = req.body;

    // ===============================
    // 1️⃣ VALIDASI INPUT
    // ===============================
    if (!name || !pauth || !pacct || !mikrotik || !deskripsi) {
      return res.json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

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

      // const vpn = await AkunVpnModel.getIpPortApi(
      //   mkData.host,
      //   mkData.port_api
      // );

      // if (!vpn) {
      //   return res.json({
      //     success: false,
      //     message: 'Akun VPN tidak ditemukan'
      //   });
      // }

      // ===============================
      // 3️⃣ INSERT DB DULU (AMAN)
      // ===============================
      const nasData = {
        nasname: mkData.host,
        shortname: name,
        type: 'other',
        secret: SECRET,
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

      try {
        await conn.connect();

        // hapus radius lama (by comment)
        const existing = await conn.write('/radius/print');
        for (const r of existing) {
          if (r.comment === COMMENT) {
            await conn.write('/radius/remove', [
              `=.id=${r['.id']}`
            ]);
          }
        }

        // add radius (langsung aktif)
        await conn.write('/radius/add', [
          `=address=${radIp}`,
          `=secret=${SECRET}`,
          `=service=ppp,hotspot`,
          `=authentication-port=${pauth}`,
          `=accounting-port=${pacct}`,
          '=timeout=2s',
          `=comment=${COMMENT}`
        ]);

        // enable incoming radius
        await conn.write('/radius/incoming/set', [
          '=accept=yes'
        ]);

        // hotspot profiles
        const profiles = await conn.write(
          '/ip/hotspot/profile/print'
        );

        for (const p of profiles) {
          await conn.write('/ip/hotspot/profile/set', [
            `=.id=${p['.id']}`,
            '=use-radius=yes',
            '=radius-interim-update=5m'
          ]);
        }

        // PPP
        await conn.write('/ppp/aaa/set', [
          '=use-radius=yes',
          '=accounting=yes',
          '=interim-update=5m'
        ]);

        res.json({
          success: true,
          message: 'Radius client berhasil dibuat'
        });

      } catch (mkErr) {
        console.error('Mikrotik error:', mkErr.message);

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
  
}

module.exports = NasController;