const mikrotikHelper = require('../../helpers/mikrotikHelper');
const ModMikrotik = require("../../models/admin/mikrotikModel");

class MikrotikController {

  // Tampilkan halaman index
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const rows = await ModMikrotik.all();

    res.render("admin/mikrotik/index", {
      title: "Manajemen Mikrotik Client",
      rows,
      flashData
    });
  }

  // Ambil data Mikrotik by ID (untuk view & edit AJAX)
  static async getById(req, res) {
    const id = req.params.id;
    const row = await ModMikrotik.findById(id);
    if (row) res.json(row);
    else res.status(404).json({ message: "Data tidak ditemukan" });
  }

  // Tambah Mikrotik baru
  static async add(req, res) {
    try {
      const { host, name, password, port_api, ros, username } = req.body;

      // 1. Validasi: tidak boleh ada yang kosong
      if (!host || !name || !password || !port_api || !ros || !username) {
        return res.json({
          success: false,
          icon: 'warning',
          title: 'Gagal',
          message: 'Semua field wajib diisi'
        });
      }

      // 2. Cek host sudah ada atau belum
      const cekHost = await ModMikrotik.getByHost(host);
      if (cekHost) {
        return res.json({
          success: false,
          icon: 'warning',
          title: 'Gagal',
          message: 'Host / IP Mikrotik sudah terdaftar'
        });
      }

      // 3. Siapkan data
      const data = {
        host,
        name,
        password,
        port_api,
        ros,
        username
      };

      // bonus cek koneksi api mikrotik
      const test = await mikrotikHelper.testConnection({
        host,
        username,
        password,
        port_api
      });

      if (!test.success) {
        return res.json({
          success: false,
          icon: 'info',
          title: 'Info',
          message: test.message || 'Periksa Ip/Host, Port, User dan password'
        });
      }

      // 4. Simpan ke database
      const roolback = await ModMikrotik.add(data);

      // 5. Response sukses
      res.json({
        success: true,
        icon: 'success',
        title: 'Berhasil',
        message: `Berhasil menambah mikrotik ${name}`,
        data: roolback
      });

    } catch (err) {
      console.error(err);
      res.json({
        success: false,
        icon: 'error',
        title: 'Error',
        message: err.message
      });
    }
  }

  // Edit Mikrotik
  static async edit(req, res) {
    try {
      const id = req.params.id;
      const {
        name,
        host,
        ros,
        port_api,
        username,
        password
      } = req.body;

      // 1. Validasi kosong
      if (!name || !host || !ros || !port_api || !username || !password) {
        return res.json({
          success: false,
          message: 'Field wajib tidak boleh kosong'
        });
      }

      // 2. Cek host unik (kecuali dirinya sendiri)
      const exist = await ModMikrotik.getByHost(host);
      if (exist && exist.id != id) {
        return res.json({
          success: false,
          message: 'Host / IP Mikrotik sudah digunakan'
        });
      }

      //cek koneksi api mikrotik
      const test = await mikrotikHelper.testConnection({
        host,
        username,
        password,
        port_api
      });

      if (!test.success) {
        return res.json({
          success: false,
          message: test.message || 'Periksa Ip/Host, Port, User dan password'
        });
      }

      await ModMikrotik.clientUpdate(id, {
        name,
        host,
        ros,
        port_api,
        username,
        password
      });

      res.json({
        success: true,
        message: 'Data Mikrotik berhasil diperbarui'
      });

    } catch (err) {
      console.error(err);
      res.json({
        success: false,
        message: err.message
      });
    }
  }

  // Delete Mikrotik
  static async delete(req, res) {
    try {
      const id = req.params.id;
      await ModMikrotik.delete(id);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: err.message });
    }
  }
}

module.exports = MikrotikController;
