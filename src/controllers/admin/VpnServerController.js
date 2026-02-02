const ServerVpn = require("../../models/serverVpnModel");
const LimitVpnModel = require("../../models/admin/vpnModel");
const TypeVpnModel = require("../../models/typeVpnModel");

class VpnServerController {
  // =======================
  // VIEW PAGES
  // =======================
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
  
  static async allAccountVpn(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;
  
      // 🔹 Ambil semua data akun VPN dari model
      const accounts = await LimitVpnModel.allAccount();
      
      //console.log(accounts);
  
      res.render("vpn-server/all_account", {
        title: "Manajemen Akun VPN",
        accounts,
        flashData
      });
    } catch (error) {
      console.error("Error allAccountVpn:", error);
      req.session.flashData = {
        type: "danger",
        text: "Gagal memuat data akun VPN."
      };
      res.redirect("/admin/vpn-server");
    }
  }
  
  // Create akun
  static async addAccount(req, res) {
    try {
      const newData = req.body;
      const created = await LimitVpnModel.createAccount(newData);
      res.json({ success: true, message: "Akun VPN berhasil ditambahkan", data: created });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: "Gagal menambahkan akun." });
    }
  }
  
  // Update akun
  static async updateAccount(req, res) {
    try {
      const { id, ...data } = req.body;
      await LimitVpnModel.updateAccount(id, data);
      res.json({ success: true, message: "Akun VPN berhasil diperbarui" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: "Gagal memperbarui akun." });
    }
  }
  
  // Hapus akun
  static async deleteAccount(req, res) {
    try {
      const { id } = req.params;
      await LimitVpnModel.deleteAccount(id);
      res.json({ success: true, message: "Akun VPN berhasil dihapus" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: "Gagal menghapus akun." });
    }
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

  // =======================
  // LIMIT AKUN VPN
  // =======================
  static async vpnLimit(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const limits = await LimitVpnModel.getAllData();
    const allUsers = await LimitVpnModel.getAllUser();

    res.render("vpn-server/limit-vpn", {
      title: "Limitasi Akun Vpn",
      allUsers,
      limits,
      flashData
    });
  }

  // =======================
  // 🔹 TAMBAH DATA LIMIT
  // =======================
  static async addLimitAkun(req, res) {
  try {
    const { username, limit } = req.body;

    if (!username || !limit) {
      return res.json({ success: false, message: "Username dan limit wajib diisi." });
    }

    // 🔍 Cari user dari tabel users
    const allUsers = await LimitVpnModel.getAllUser();
    const selectedUser = allUsers.find(u => u.username === username);

    if (!selectedUser) {
      return res.json({ success: false, message: "User tidak ditemukan di sistem." });
    }

    // 🔒 Cek apakah user ini sudah punya data limit
    const existingLimit = await LimitVpnModel.getLimitByUsername(username);
    if (existingLimit) {
      return res.json({
        success: false,
        message: `User "${username}" sudah memiliki data limit. Tidak bisa menambahkan duplikat.`
      });
    }

    // ✅ Jika aman, buat data baru
    const newLimitData = await LimitVpnModel.createLimit({
      user_id: selectedUser.id,
      username: selectedUser.username,
      limit: parseInt(limit),
      used: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    return res.json({
      success: true,
      message: "Data limit akun VPN berhasil ditambahkan.",
      data: newLimitData
    });
  } catch (err) {
    console.error("Error addLimitAkun:", err);
    return res.json({ success: false, message: "Terjadi kesalahan server." });
  }
}


  // =======================
  // 🔹 UPDATE DATA LIMIT
  // =======================
  static async updateLimitAkun(req, res) {
    try {
      const { id, username, limit } = req.body;

      const current = await LimitVpnModel.getLimitById(id);
      if (!current) {
        return res.json({ success: false, message: "Data tidak ditemukan." });
      }

      if (parseInt(limit) < parseInt(current.used)) {
        return res.json({
          success: false,
          message: "Limit tidak boleh lebih kecil dari jumlah akun yang digunakan."
        });
      }

      // Cari user_id dari username (jika diubah)
      const user = await LimitVpnModel.getAllUser().then(users =>
        users.find(u => u.username === username)
      );

      if (!user) {
        return res.json({ success: false, message: "Username tidak ditemukan di sistem." });
      }

      const success = await LimitVpnModel.updateLimitById(id, {
        user_id: user.id,
        username: user.username,
        limit: parseInt(limit)
      });

      if (!success) {
        return res.json({ success: false, message: "Gagal memperbarui data." });
      }

      return res.json({ success: true, message: "Limit berhasil diperbarui." });
    } catch (err) {
      console.error("Error updateLimitAkun:", err);
      return res.json({ success: false, message: "Terjadi kesalahan server." });
    }
  }

  // =======================
  // 🔹 HAPUS DATA LIMIT
  // =======================
  static async deleteLimitAkun(req, res) {
    try {
      const { id } = req.params;

      const existing = await LimitVpnModel.getLimitById(id);
      if (!existing) {
        return res.json({ success: false, message: "Data tidak ditemukan." });
      }

      const success = await LimitVpnModel.deleteLimitById(id);
      if (!success) {
        return res.json({ success: false, message: "Gagal menghapus data." });
      }

      return res.json({ success: true, message: "Data berhasil dihapus." });
    } catch (err) {
      console.error("Error deleteLimitAkun:", err);
      return res.json({ success: false, message: "Terjadi kesalahan server." });
    }
  }
}

module.exports = VpnServerController;
