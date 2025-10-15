const PlnModel = require("../models/plnModel");
const path = require("path");

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
      const id = req.body.id || req.params.id;
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

  // =========================
  // 💰 Transaksi PLN (form)
  // =========================
  static async transaksi(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;
      // Ambil data pelanggan untuk form transaksi
      const pelanggan = await PlnModel.findAll();

      res.render("pln/transaksi", {
        title: "Transaksi Pembayaran PLN",
        pelanggan,
        flashData,
      });
    } catch (error) {
      console.error("Error in PlnController.transaksi:", error.message);
      res.status(500).send("Gagal memuat halaman transaksi PLN.");
    }
  }

  // 💾 Simpan transaksi (POST)
  static async transaksiStore(req, res) {
    try {
      const { pln_id, nominal, keterangan } = req.body;

      if (!pln_id || !nominal) {
        req.session.flashData = { type: "warning", text: "Pelanggan dan nominal wajib diisi." };
        return res.redirect("/admin/mgmn-pln/transaksi");
      }

      await PlnModel.saveTransaksi(pln_id, nominal, keterangan);

      req.session.flashData = { type: "success", text: "Transaksi PLN berhasil disimpan." };
      res.redirect("/admin/mgmn-pln/riwayat");
    } catch (error) {
      console.error("Error in PlnController.transaksiStore:", error.message);
      req.session.flashData = { type: "danger", text: "Gagal menyimpan transaksi PLN." };
      res.redirect("/admin/mgmn-pln/transaksi");
    }
  }

  // =========================
  // 📤 Upload Bukti Pembayaran
  // =========================
  static async uploadForm(req, res) {
    try {
      const pelanggan = await PlnModel.findAll();

      res.render("pln/upload-bukti", {
        title: "Upload Bukti Pembayaran PLN",
        pelanggan,
      });
    } catch (error) {
      console.error("Error in PlnController.uploadForm:", error.message);
      res.status(500).send("Gagal memuat form upload bukti.");
    }
  }

  static async uploadBukti(req, res) {
    try {
      const pln_id = req.body.pln_id || req.body.pelanggan_id;
      const file = req.file;

      if (!pln_id || !file) {
        req.session.flashData = { type: "danger", text: "Pelanggan dan file bukti wajib diisi." };
        return res.redirect("/admin/mgmn-pln/upload-bukti");
      }

      // simpan path relatif yang bisa diakses static
      const filePath = path.posix.join("/uploads/bukti_pln", file.filename);

      const ok = await PlnModel.saveBukti(pln_id, filePath);

      if (!ok) {
        req.session.flashData = { type: "warning", text: "Gagal menyimpan bukti ke database." };
        return res.redirect("/admin/mgmn-pln/upload-bukti");
      }

      req.session.flashData = { type: "success", text: "Bukti pembayaran berhasil diunggah." };
      res.redirect("/admin/mgmn-pln/riwayat");
    } catch (error) {
      console.error("Error in PlnController.uploadBukti:", error.message);
      req.session.flashData = { type: "danger", text: "Gagal mengunggah bukti pembayaran." };
      res.redirect("/admin/mgmn-pln/upload-bukti");
    }
  }

  // =========================
  // 🧾 Riwayat & Struk
  // =========================
  static async riwayat(req, res) {
    try {
      const data = await PlnModel.findRiwayat();

      res.render("pln/riwayat", {
        title: "Riwayat & Struk PLN",
        data,
      });
    } catch (error) {
      console.error("Error in PlnController.riwayat:", error.message);
      res.status(500).send("Gagal memuat riwayat pembayaran PLN.");
    }
  }
}

module.exports = PlnController;
