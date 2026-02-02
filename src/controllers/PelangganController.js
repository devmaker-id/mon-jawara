const pelangganModel = require("../models/pelangganModel");
const groupModel = require("../models/radiusd/profileGroupModel");

class PelangganController {
  static async userHotspot(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const pelanggan = await pelangganModel.getByServiceType("HOTSPOT");
    const profileGroup = await groupModel.findByServiceType("HOTSPOT", req.user.id);
    
    
    //console.log(pelanggan);
    
    res.render("pelanggan/user-hotspot", {
      title: "List User Hotspot",
      pelanggan,
      profileGroup,
      flashData
    });
  }
  
  static async addUserHotspot(req, res) {
    try {
      const {
        fullname,
        user_type,
        paket,
        username,
        secret
      } = req.body;
  
      // Validasi wajib
      if (!fullname || !user_type || !paket || !username) {
        return res.status(400).json({ success: false, message: "Data tidak lengkap." });
      }
  
      // Validasi enum
      const allowedUserTypes = ["MEMBER", "VOUCHER"];
      const finalUserType = user_type.toUpperCase();
      const finalServiceType = "HOTSPOT"; // statis, karena untuk hotspot
  
      if (!allowedUserTypes.includes(finalUserType)) {
        return res.status(400).json({ success: false, message: "User type tidak valid." });
      }
  
      // Ambil data paket
      const dbpaket = await groupModel.findById(paket);
      if (!dbpaket) {
        return res.status(400).json({ success: false, message: "Paket tidak ditemukan." });
      }
      //console.log(dbpaket);
  
      // Jika VOUCHER → password = username
      const finalSecret = finalUserType === "VOUCHER" ? username : secret;
  
      const result = await pelangganModel.create({
        fullname,
        paket: dbpaket.groupname,
        user_type: finalUserType,
        service_type: finalServiceType,
        username,
        secret: finalSecret
      });
  
      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "User hotspot berhasil ditambahkan."
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Gagal menyimpan ke database."
        });
      }
  
    } catch (error) {
      console.error("Gagal menambahkan user hotspot:", error.message);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server."
      });
    }
  }
  
  static async deleteUserHotspot(req, res) {
    try {
      const id = req.params.id;
      const result = await pelangganModel.delete(id);
  
      if (result.affectedRows > 0) {
        return res.json({ success: true, message: "User berhasil dihapus." });
      } else {
        return res.status(404).json({ success: false, message: "User tidak ditemukan." });
      }
    } catch (error) {
      console.error("Gagal hapus user:", error.message);
      return res.status(500).json({ success: false, message: "Kesalahan server." });
    }
  }

  
  //PPP CONTROLLER
  static async userPppoe(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    res.render("pelanggan/user-pppoe", {
      title: "List User Pppoe",
      flashData,
    });
  }
}

module.exports = PelangganController;