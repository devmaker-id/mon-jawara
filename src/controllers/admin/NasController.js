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
    
    //console.log("Nas:\n", nasClients);

    res.render("nas-client/index", {
      title: "Nas Client Manajemen",
      nasClients,
      flashData
    });
  }
  static async newNas(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    res.render("nas-client/nas_new", {
      title: "Tambah Nas Client",
      flashData
    });
  }
  static async newNasUseVpn(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    //const user = req.session.user;
    const mkclient = await MikrotikModel.getByUserNoUsedNas(req.user.id);
    
    const radPort = await RadServer.getServersByUserId(req.user.id)
    
    //console.log(radPort);
    
    res.render("nas-client/nas_new_use_vpn", {
      title: "Tambah Nas Dengan Vpn",
      mkclient,
      flashData,
      radPort
    });
  }
  
  static async buatRadiusClient(req, res) {
    const radIp = "172.10.0.253";
    const { name, pauth, pacct, mikrotik, deskripsi, domain } = req.body;

    // Validasi input
    if (!name || !radIp || !pauth || !pacct || !mikrotik || !deskripsi) {
      return res.json({ success: false, message: 'Semua field wajib diisi.' });
    }

    try {
      // Ambil data koneksi Mikrotik
      const mkData = await MikrotikModel.getById(mikrotik);
      if (!mkData) {
        return res.json({ success: false, message: 'Mikrotik tidak ditemukan.' });
      }

      //console.log(`🛠️ Membuat radius client di Mikrotik: ${mkData.host} untuk ${name}`);

      const conn = new RouterOSAPI({
        host: mkData.host,
        user: mkData.username,
        password: mkData.password,
        port: mkData.port_api,
      });

      try {
        await conn.connect();
      } catch (connErr) {
        console.error('❌ Gagal koneksi ke Mikrotik:', connErr);
        return res.json({ success: false, message: 'Gagal terhubung ke Mikrotik.' });
      }

      try {
        const comment = 'added by mon-jawara';

        // Hapus radius client sebelumnya (berdasarkan comment)
        const existing = await conn.write('/radius/print');
        //console.log(existing);
        for (const item of existing) {
          if (item.comment === comment) {
            await conn.write('/radius/remove', [`=.id=${item['.id']}`]);
          }
        }

        // Tambahkan radius client baru
        await conn.write('/radius/add', [
          `=address=${radIp}`,
          '=secret=Jawara1234',
          '=service=ppp,hotspot',
          `=accounting-port=${pacct}`,
          `=authentication-port=${pauth}`,
          '=timeout=2s',
          `=comment=${comment}`
        ]);

        // Aktifkan incoming radius
        await conn.write('/radius/incoming/set', ['=accept=yes']);

        // Aktifkan use-radius di semua hotspot profile
        const hotspotProfiles = await conn.write('/ip/hotspot/profile/print');
        const hotspotSetPromises = hotspotProfiles.map(profile =>
          conn.write('/ip/hotspot/profile/set', [
            `=.id=${profile['.id']}`,
            '=use-radius=yes',
            '=radius-interim-update=5m'
          ])
        );
        await Promise.all(hotspotSetPromises);

        // Aktifkan use-radius di ppp
        await conn.write('/ppp/aaa/set', [
          '=use-radius=yes',
          '=accounting=yes',
          '=interim-update=5m'
        ]);
        
        await MikrotikModel.updateNasUsed(mkData.id, name);
        const vpn = await AkunVpnModel.getIpPortApi(mkData.host, mkData.port_api);
        if (!vpn) {
          return res.json({ success: false, message: 'Akun Vpn Ga ditemukan' });
        }
        const nasData = {
          nasname: vpn.ip_vpn,
          shortname: name,
          type: "other",
          secret: "Jawara1234",
          description: deskripsi,
          status: "online" // [online, offline]
        };
        await NasModel.createNas(nasData);
        
        //console.log('✅ Radius client berhasil ditambahkan dan dikonfigurasi');
        res.json({ success: true });

      } catch (execErr) {
        console.error('❌ Error saat menjalankan perintah Mikrotik:', execErr);
        res.json({ success: false, message: 'Gagal menambahkan konfigurasi radius.' });
      } finally {
        // Tutup koneksi dengan Mikrotik
        await conn.close().catch(() => {});
      }

    } catch (err) {
      console.error('❌ Error umum:', err);
      res.json({ success: false, message: 'Terjadi kesalahan server.' });
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