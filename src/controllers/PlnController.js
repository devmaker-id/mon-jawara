const PlnModel = require("../models/plnModel");

class PlnController {
  // 🧭 Tampilkan semua data PLN
  static async index(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;

      const data = await PlnModel.findAll();

      res.render("pln/index", {
        title: "Manajemen PLN Pelanggan",
        flashData,
        data,
      });
    } catch (error) {
      console.error("Error in PlnController.index:", error.message);
      res.status(500).send("Terjadi kesalahan saat memuat data pelanggan PLN.");
    }
  }

  // ➕ Tampilkan form tambah data
  static async createForm(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;

      res.render("pln/create", {
        title: "Tambah Pelanggan PLN",
        flashData,
      });
    } catch (error) {
      console.error("Error in PlnController.createForm:", error.message);
      res.status(500).send("Terjadi kesalahan saat memuat form tambah PLN.");
    }
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
        status: "aktif",
      });

      req.session.flashData = {
        type: "success",
        text: "Data pelanggan PLN berhasil ditambahkan.",
      };
      res.redirect("/admin/mgmn-pln");
    } catch (error) {
      console.error("Error in PlnController.store:", error.message);
      req.session.flashData = {
        type: "danger",
        text: "Gagal menambahkan data pelanggan PLN.",
      };
      res.redirect("/admin/mgmn-pln");
    }
  }

  // ✏️ Tampilkan form edit data
  static async editForm(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;

      const id = req.params.id;
      const pln = await PlnModel.findById(id);

      if (!pln) {
        req.session.flashData = {
          type: "warning",
          text: "Data pelanggan PLN tidak ditemukan.",
        };
        return res.redirect("/admin/mgmn-pln");
      }

      res.render("pln/edit", {
        title: "Edit Pelanggan PLN",
        pln,
        flashData,
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
        status,
      });

      if (!success) {
        req.session.flashData = {
          type: "warning",
          text: "Data tidak ditemukan atau gagal diperbarui.",
        };
        return res.redirect("/admin/mgmn-pln");
      }

      req.session.flashData = {
        type: "success",
        text: "Data pelanggan PLN berhasil diperbarui.",
      };
      res.redirect("/admin/mgmn-pln");
    } catch (error) {
      console.error("Error in PlnController.update:", error.message);
      req.session.flashData = {
        type: "danger",
        text: "Gagal memperbarui data pelanggan PLN.",
      };
      res.redirect("/admin/mgmn-pln");
    }
  }

  // ❌ Hapus data
  static async destroy(req, res) {
    try {
      const id = req.params.id;
      const success = await PlnModel.delete(id);

      if (!success) {
        req.session.flashData = {
          type: "warning",
          text: "Data pelanggan PLN tidak ditemukan atau gagal dihapus.",
        };
        return res.redirect("/admin/mgmn-pln");
      }

      req.session.flashData = {
        type: "success",
        text: "Data pelanggan PLN berhasil dihapus.",
      };
      res.redirect("/admin/mgmn-pln");
    } catch (error) {
      console.error("Error in PlnController.destroy:", error.message);
      req.session.flashData = {
        type: "danger",
        text: "Gagal menghapus data pelanggan PLN.",
      };
      res.redirect("/admin/mgmn-pln");
    }
  }
}

module.exports = PlnController;
