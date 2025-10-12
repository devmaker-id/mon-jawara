const UserModel = require("../models/userModel");

class UserController {
  
  static async index(req, res) {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }
    
    res.render("user/index", {
      title: "User Profile",
      user: req.session.user,
      message: req.session.message || null,
    });
    delete req.session.message;
  }
  
  static async update(req, res) {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }
    let { fullname, phone, address } = req.body;
    if (!fullname || !phone || !address) {
      req.session.message = {
        type: "danger",
        text: "Semua field wajib diisi.",
      };
      return res.redirect("/user/profile");
    }
    
    const validator = require("validator");
    // Trim & sanitize
    fullname = validator.trim(fullname);
    fullname = validator.escape(fullname);
    
    phone = validator.trim(phone);
    
    address = validator.trim(address);
    address = validator.escape(address);
    
    // Validasi nama (hanya huruf dan spasi)
    if (!validator.isAlpha(fullname.replace(/\s/g, ''))) {
      req.session.message = {
        type: "danger",
        text: "Nama hanya boleh berisi huruf dan spasi.",
      };
      return res.redirect("/user/profile");
    }
    
    // Validasi nomor telepon (opsional)
    if (!validator.isMobilePhone(phone, 'id-ID')) {
      req.session.message = {
        type: "danger",
        text: "Nomor telepon tidak valid.",
      };
      return res.redirect("/user/profile");
    }
    
    // Validasi panjang minimal
    if (address.length < 5) {
      req.session.message = {
        type: "danger",
        text: "Masukan alamat lengkap yang benar. kp/jl, rt/rw, kelurahan/kecamatan, kabupaten",
      };
      return res.redirect("/user/profile");
    }

    const userId = req.session.user.id;
    try {
      const result = await UserModel.updateProfile(userId, { fullname, phone, address });
  
      if (!result) {
        req.session.message = {
          type: "danger",
          text: "Gagal memperbarui profil.",
        };
        return res.redirect("/user/profile");
      }
      
      // Update session user biar data baru langsung tampil
      req.session.user.fullname = fullname;
      req.session.user.telepon = phone;
      req.session.user.alamat = address;
  
      req.session.message = {
        type: "success",
        text: "Profil berhasil diperbarui.",
      };
  
      res.redirect("/user/profile");
    } catch (error) {
      console.error("Update profile error:", error);
      req.session.message = {
        type: "danger",
        text: "Terjadi kesalahan server.",
      };
      res.redirect("/user/profile");
    }
  }

  
}

module.exports = UserController;