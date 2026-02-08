const ProfileHotspotModel = require("../models/profileHotspotModel");
const BandwidthModel = require("../models/banwithModel");
const UserModel = require("../models/userModel");
const ProfileModule = require("../models/profilegroup/profile.model");
const NasModel = require('../models/radiusd/nasModel');

const groupModel = require("../models/radiusd/profileGroupModel");
const formatRateLimit = require("../utils/rateLimitFormatter");
const { formatLimitasi, parseLimitasi } = require('../utils/formatLimitasi');


class ProfilePaketController {
  // ================= PROFILE GROUP =================
  static async profileGroup(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const module = await ProfileModule.getAll();
    const nas = await NasModel.findAll();
    const owners = await UserModel.findAll();

    res.render("profile-paket/profile-group", {
      title: "Profile Group Manajement",
      module,
      nas,
      owners,
      flashData,
    });
  }

  // ================= PROFILE HOTSPOT =================
  static async profileHotspot(req, res) {
    try {
      const flashData = req.session.flashData;
      delete req.session.flashData;
      
      const profiles = await groupModel.findByServiceType("HOTSPOT", req.user.id);
      //console.log(profiles);
      
      const bandwidths = await BandwidthModel.findAll();
      //console.log(bandwidths);
      
      const users = req.user.akun_type === "admin" ? await UserModel.findAll() : [req.user];

      res.render("profile-paket/profile-hotspot", {
        title: "Profile Hotspot Manajement",
        flashData,
        profiles,
        bandwidths,
        users,
        currentUser: req.user
      });
    } catch (error) {
      console.error("Gagal render profile hotspot:", error.message);
      res.status(500).send("Terjadi kesalahan saat memuat halaman.");
    }
  }
  
  static async getProfileHotspot(req, res) {
    try {
      const { id } = req.params;
  
      const profile = await groupModel.findById(id);
  
      if (!profile) {
        return res.status(404).json({ message: "Profile tidak ditemukan." });
      }
      
      //console.log(profile);
      // Durasi
      const [durasiValue, durasiUnit] = profile.durasi ? profile.durasi.split(" ") : ["", ""];
      
      // Expired
      const [expiredValue, expiredUnit] = profile.expired ? profile.expired.split(" ") : ["", ""];
      
      const data = {
        ...profile,
        durasiValue,
        durasiUnit,
        expiredValue,
        expiredUnit
      };
      
      //console.log(data);
  
      return res.status(200).json(data);
    } catch (error) {
      console.error("Gagal mengambil data profile:", error.message);
      return res.status(500).json({ message: "Terjadi kesalahan saat mengambil data." });
    }
  }

  static async storeHotspot(req, res) {
    try {
      // Konversi durasi dan expired
      let durasi, expired;
      if (req.body.limit_enabled) {
        durasi = `${req.body.duration_value} ${req.body.duration_unit}`;
        expired = `${req.body.expired_value} ${req.body.expired_unit}`;
      } else {
        durasi = "unlimited";
        expired = "unlimited";
      }
      
      // Ambil data bandwidth
      const burstEnabled = req.body.burst_enabled;
      const bw = await BandwidthModel.findById(req.body.bandwidth_id);
      if (!bw) {
        return res.status(404).json({ message: "Bandwidth tidak ditemukan." });
      }
  
      const rateLimit = formatRateLimit(bw, burstEnabled);
  
      // Susun data akhir
      const values = {
        groupname: req.body.name,
        service_type: "HOTSPOT",
        harga_modal: req.body.harga_modal || 0,
        harga_jual: req.body.harga_jual || 0,
        speed_internet: rateLimit,
        shared_users: req.body.shared_users,
        durasi: durasi,
        expired: expired,
        owner_id: req.user.id, // dari session user
        owner_name: req.user.username // asumsi ada di user
      };
  
      // Simpan ke DB jika sudah siap
      await groupModel.create(values);
  
      return res.status(200).json({
        //data: values,
        message: "Profile berhasil ditambahkan."
      });
  
    } catch (error) {
      console.error("Gagal menyimpan:", error.message);
      return res.status(500).json({ message: "Gagal menyimpan profile." });
    }
  }

  static async updateHotspot(req, res) {
    try {
      const id = req.params.id;
      
      // Cek apakah checkbox unlimited dicentang
      const isDurasiUnlimited = req.body.durasi_unlimited === "on";
      const isExpiredUnlimited = req.body.expired_unlimited === "on";
  
      // Tentukan nilai durasi dan expired
      const durasi = isDurasiUnlimited
        ? "unlimited"
        : `${req.body.durasiValue} ${req.body.durasiUnit}`;
  
      const expired = isExpiredUnlimited
        ? "unlimited"
        : `${req.body.expiredValue} ${req.body.expiredUnit}`;

  
      const values = {
        id: id,
        groupname: req.body.name,
        harga_modal: req.body.harga_modal,
        harga_jual: req.body.harga_jual,
        speed_internet: req.body.bandwidth,
        shared_users: parseInt(req.body.shared_users || 1),
        durasi: durasi,
        expired: expired
      };
  
      const result = await groupModel.update(values);
  
      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: "Profile berhasil diperbarui.",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Tidak ada perubahan pada data.",
        });
      }
    } catch (error) {
      console.error("Update error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat memperbarui profile.",
      });
    }
  }

  
  static async destroyHotspot(req, res) {
    try {
      const id = req.params.id;
      const deleted = await groupModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Profile tidak ditemukan." });
      }
      res.json({ message: "Profile berhasil dihapus." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan server." });
    }
  }

  // ================= PROFILE PPPoE =================
  static async profilePppoe(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    res.render("profile-paket/profile-pppoe", {
      title: "Profile PPPoE Manajement",
      flashData,
    });
  }

  //add group profile
  static async profileGroupAdd(req, res) {
    const data = req.body;
    return res.status(200).json({
      data
    });
  }

}

module.exports = ProfilePaketController;
