const PlnModel = require("../models/plnModel");

class PlnController {
  // 🧭 Tampilkan semua data PLN
  static async index(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;

      const data = await PlnModel.findAll();

      res.render("pln/index", {
        title: "Manajemen PLN Kontrak",
        flashData,
        data
      });
    } catch (error) {
      console.error("Error in PlnController.index:", error.message);
      res.status(500).send("Terjadi kesalahan saat memuat data.");
    }
  }

  // ➕ Tampilkan form tambah data
  static async createForm(req, res) {
    res.render("pln/create", {
      title: "Tambah Pelanggan PLN"
    });
  }

  // ➕ Simpan data baru
  static async store(req, res) {
    try {
      const { nama, jenis_pln, alamat, no_pln, keterangan } = req.body;

      await PlnModel.create({
        nama,
        jenis_pln,
        alamat,
        no_pln,
        keterangan,
        status: "aktif"
      });

      req.session.flashData = { type: "success", message: "Data pelanggan berhasil ditambahkan." };
      res.redirect("/pln");
    } catch (error) {
      console.error("Error in PlnController.store:", error.message);
      req.session.flashData = { type: "danger", message: "Gagal menambahkan data pelanggan." };
      res.redirect("/pln");
    }
  }

  // ✏️ Tampilkan form edit data
  static async editForm(req, res) {
    try {
      const id = req.params.id;
      const data = await PlnModel.findById(id);

      if (!data) {
        req.session.flashData = { type: "warning", message: "Data tidak ditemukan." };
        return res.redirect("/pln");
      }

      res.render("pln/edit", {
        title: "Edit Data PLN",
        data
      });
    } catch (error) {
      console.error("Error in PlnController.editForm:", error.message);
      res.status(500).send("Terjadi kesalahan saat memuat data untuk diedit.");
    }
  }

  // 🧩 Proses update data
  static async update(req, res) {
    try {
      const id = req.params.id;
      const { nama, jenis_pln, alamat, no_pln, keterangan, status } = req.body;

      const success = await PlnModel.update(id, {
        nama,
        jenis_pln,
        alamat,
        no_pln,
        keterangan,
        status
      });

      if (!success) {
        req.session.flashData = { type: "warning", message: "Data tidak ditemukan atau gagal diperbarui." };
        return res.redirect("/pln");
      }

      req.session.flashData = { type: "success", message: "Data pelanggan berhasil diperbarui." };
      res.redirect("/pln");
    } catch (error) {
      console.error("Error in PlnController.update:", error.message);
      req.session.flashData = { type: "danger", message: "Gagal memperbarui data pelanggan." };
      res.redirect("/pln");
    }
  }

  // ❌ Hapus data
  static async destroy(req, res) {
    try {
      const id = req.params.id;
      const success = await PlnModel.delete(id);

      if (!success) {
        req.session.flashData = { type: "warning", message: "Data tidak ditemukan atau gagal dihapus." };
        return res.redirect("/pln");
      }

      req.session.flashData = { type: "success", message: "Data pelanggan berhasil dihapus." };
      res.redirect("/pln");
    } catch (error) {
      console.error("Error in PlnController.destroy:", error.message);
      req.session.flashData = { type: "danger", message: "Gagal menghapus data pelanggan." };
      res.redirect("/pln");
    }
  }
}

module.exports = PlnController;
