const BandwidthModel = require("../models/banwithModel");

class BanwithController {

  // Tampilkan halaman index
  static async index(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;

      const profiles = await BandwidthModel.findAll(); // Ambil semua data dari DB

      res.render("banwith/index", {
        title: "Manajemen Bandwidth",
        flashData,
        profiles
      });
    } catch (error) {
      console.error("Error in BanwithController.index:", error.message);
      res.status(500).send("Terjadi kesalahan saat memuat data.");
    }
  }

  // Proses tambah bandwidth
  static async store(req, res) {
    try {
      const result = await BandwidthModel.create({
        ...req.body,
        user_id: req.session.user.id,
        owner_name: req.session.user.username,
      });

      req.session.flashData = {
        type: "success",
        message: "Profil bandwidth berhasil ditambahkan."
      };
      res.redirect("/admin/banwith-management");
    } catch (error) {
      console.error("Error in BanwithController.store:", error.message);
      req.session.flashData = {
        type: "danger",
        message: "Gagal menambahkan data."
      };
      res.redirect("/admin/banwith-management");
    }
  }

  // Proses update
  static async update(req, res) {
    try {
      const id = req.body.id;
      const result = await BandwidthModel.update(id, {
        ...req.body,
        user_id: req.session.user.id
      });

      req.session.flashData = {
        type: result ? "success" : "warning",
        message: result ? "Profil berhasil diupdate." : "Data tidak ditemukan atau tidak berubah."
      };
      res.redirect("/admin/banwith-management");
    } catch (error) {
      console.error("Error in BanwithController.update:", error.message);
      req.session.flashData = {
        type: "danger",
        message: "Gagal mengubah data."
      };
      res.redirect("/admin/banwith-management");
    }
  }

  // Proses hapus
  static async destroy(req, res) {
    try {
      const id = req.body.id;
      const success = await BandwidthModel.delete(id);

      req.session.flashData = {
        type: success ? "success" : "warning",
        message: success ? "Profil berhasil dihapus." : "Data tidak ditemukan."
      };
      res.redirect("/admin/banwith-management");
    } catch (error) {
      console.error("Error in BanwithController.destroy:", error.message);
      req.session.flashData = {
        type: "danger",
        message: "Gagal menghapus data."
      };
      res.redirect("/admin/banwith-management");
    }
  }
}

module.exports = BanwithController;
