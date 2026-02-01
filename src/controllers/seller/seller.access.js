const AccessSeller = require("../../models/seller/access.model");
const OnuModel = require("../../models/seller/onu.model");

class SellerController {

    static async index(req, res) {
        try {
            const flashData = req.session.flashData;
            delete req.session.flashData;

            const allAccess = await AccessSeller.getAll();

            res.render("seller/aksess_khusus", {
                title: "Manajemen Seller Access",
                allAccess,
                flashData
            });

        } catch (error) {
            console.error(error);
                res.status(500).render("errors/500", {
                message: "Gagal memuat data seller access"
            });
        }
    }

    static async getAvailableSellers(req, res) {
        try {
            const sellers = await AccessSeller.getAvailableSellers();
            res.json({ success: true, data: sellers });
        } catch (err) {
            res.status(500).json({ success: false });
        }
    }

    static async onuAvailabel(req, res) {

        try {
            const sellers = await OnuModel.getAvailableOnu();
            res.json({ success: true, data: sellers });
        } catch (err) {
            res.status(500).json({ success: false });
        }
    }

    static async create(req, res) {
      try {
        let user, pass;
    
        const {
          seller_id,
          onu_id,
          akun_type,
          status,
          voucher_code,
          username,
          password
        } = req.body;
    
        // Validasi akun_type
        if (akun_type !== "vc" && akun_type !== "up") {
          return res.status(400).json({
            success: false,
            message: "Akun type tidak didukung"
          });
        }
    
        // Pilih user dan pass berdasarkan akun_type
        if (akun_type === "vc") {
          user = voucher_code;
          pass = voucher_code;
        } else if (akun_type === "up") {
          user = username;
          pass = password;
        }
    
        // Validasi status
        if (status !== "enable" && status !== "disable") {
          return res.status(400).json({
            success: false,
            message: "Status tidak didukung"
          });
        }
    
        // Siapkan data untuk create
        const params = {
          seller_id,
          onu_id,
          akun_type,
          status,
          username: user,
          password: pass
        };
    
        // console.log("Data yang akan dibuat:", params);
    
        // Simpan ke database
        const result = await AccessSeller.create(params);
    
        return res.status(201).json({
          success: true,
          message: "Access seller berhasil dibuat",
          data: result
        });
    
      } catch (err) {
        console.error("Error create AccessSeller:", err.message);
        return res.status(500).json({
          success: false,
          message: "Terjadi kesalahan saat membuat access seller"
        });
      }
    }

    static async updateAccess(req, res) {
      const accessId = req.params.id;

      try {
        let user, pass;

        const {
          seller_id,
          onu_id,
          akun_type,
          status,
          voucher_code,
          username,
          password
        } = req.body;

        // Validasi akun_type
        if (akun_type !== "vc" && akun_type !== "up") {
          return res.status(400).json({
            success: false,
            message: "Akun type tidak didukung"
          });
        }

        // Pilih user dan pass berdasarkan akun_type
        if (akun_type === "vc") {
          user = voucher_code;
          pass = voucher_code;
        } else if (akun_type === "up") {
          user = username;
          pass = password;
        }

        // Validasi status
        if (status !== "enable" && status !== "disable") {
          return res.status(400).json({
            success: false,
            message: "Status tidak didukung"
          });
        }

        // Siapkan data untuk update
        const params = {
          seller_id,
          onu_id,
          akun_type,
          status,
          username: user,
          password: pass
        };

        // console.log("Data yang akan diupdate:", params);

        // Panggil model untuk update (pastikan implementasi update di model)
        const result = await AccessSeller.update(accessId, params);

        return res.json({
          success: true,
          message: "Access seller berhasil diupdate",
          data: result
        });

      } catch (err) {
        console.error("Error update AccessSeller:", err.message);
        return res.status(500).json({
          success: false,
          message: "Terjadi kesalahan saat mengupdate access seller"
        });
      }
    }


  static async delete(req, res) {
    const { id } = req.params; // kirim delete /admin/seller/access/:id
    try {
      const result = await AccessSeller.delete(id);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      console.error("Error delete access seller:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message || "Gagal menghapus access seller"
      });
    }
  }



}

module.exports = SellerController;