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
      const data = req.body;
      await ModMikrotik.add(data);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: err.message });
    }
  }

  // Edit Mikrotik
  static async edit(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      
      await ModMikrotik.update(id, data);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: err.message });
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
