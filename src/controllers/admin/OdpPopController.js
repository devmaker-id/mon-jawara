const OdpModel = require("../../models/odpModel");
const OnuModel = require("../../models/onuModel");

class OdpPopController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const data = await OdpModel.findAll();
      
    res.render("odppop/index", {
      title: "Manajemen ODP atau POP",
      data,
      flashData
    });
  }
  static async addNew(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
      
    res.render("odppop/add_new", {
      title: "Tambah Baru ODP atau POP",
      flashData
    });
  }
  static async updateOdpPop(req, res) {
    const { id } = req.params;
    const { odp_name, odp_capacity, odp_used, pop_location } = req.body;
  
    try {
      const result = await OdpModel.updateById(id, {
        name: odp_name,
        capacity: odp_capacity,
        used: odp_used,
        location: pop_location
      });
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Data tidak ditemukan atau tidak diubah." });
      }
  
      res.json({ success: true, message: "Data berhasil diperbarui." });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, message: "Gagal memperbarui data." });
    }
  }
  static async deleteOdp(req, res) {
    const { id } = req.params;
  
    try {
      // 🔒 Validasi data ODP
      const odp = await OdpModel.findById(id);
  
      if (!odp) {
        return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
      }
  
      if (odp.used > 0) {
        return res.status(403).json({
          success: false,
          message: `ODP/POP '${odp.name}' tidak bisa dihapus karena masih digunakan (${odp.used} port terpakai).`
        });
      }
  
      // ✅ Lanjutkan delete
      const result = await OdpModel.delete(id);
      return res.json({ success: true, message: "Data berhasil dihapus." });
  
    } catch (err) {
      console.error("Gagal menghapus ODP:", err);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan saat menghapus." });
    }
  }
  static async tambahOdp(req, res) {
    const { odp_name, odp_capacity, odp_used, location, description } = req.body;

    if (!odp_name || !odp_capacity || !location) {
      return res.json({ success: false, message: "Nama, kapasitas dan lokasi wajib diisi." });
    }

    try {
      await OdpModel.createOdp({
        name: odp_name,
        capacity: odp_capacity,
        used: odp_used,
        location,
        description
      });

      return res.json({ success: true, message: "Data berhasil ditambahkan." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan saat menyimpan data." });
    }
  }
  
  static async viewOnu(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const { id } = req.params;
    const data = await OnuModel.getByOdpId(id);
    const odp = await OdpModel.findById(id);
    const odpData = await OdpModel.findAll();
    
    if (!odp || !data) {
      req.session.flashData = {
        type: "warning",
        text: "Ga Ketemu Odp Nya."
      };
      res.redirect("/admin/odp-pop");
    }
    
    res.render("odppop/onu-view", {
      title: "List Onu : ",
      odp,
      odpData,
      data,
      flashData
    });
  }
  
}

module.exports = OdpPopController;