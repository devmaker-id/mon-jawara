const OltService = require("../../services/oltService");
const OnuUnauthModel = require("../../models/onuUnauthModel");
const OnuModel = require("../../models/onuModel");
const OdpModel = require("../../models/odpModel");
const PelangganModel = require("../../models/pelangganModel");

class OnuController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const summary = { online: 58, offline: 5, unknown: 3 }
    const routers = await OnuModel.findAll();
    const odpData = await OdpModel.findAll();
      
    res.render("onu/index", {
      title: "Manajemen Router ONU",
      summary,
      routers,
      odpData,
      flashData
    });
  }
  static async addNew(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const onuUnauth = await OnuUnauthModel.findAll();
    const odpData = await OdpModel.findAll();
    const pelanggan = await PelangganModel.getOnuIsNull();
    
    res.render("onu/add_new_onu", {
      title: "Tambah Router ONU",
      odpData,
      onuUnauth,
      pelanggan,
      flashData
    });
  }
  static async prosessTambahOnu(req, res){
    try {
      const { usertype, member_id, router_name, mac, location, odp_id } = req.body;
  
      let finalRouterName = "";
      let pelanggan = null;
  
      if(usertype === "customers"){
        pelanggan = await PelangganModel.findById(member_id);
        if(!pelanggan){
          req.session.flashData = {
            type: "danger",
            text: "Pelanggan tidak ditemukan"
          };
          return res.redirect("/admin/add-new-onu");
        }
        finalRouterName = pelanggan.fullname;
      } else {
        if(!router_name || !router_name.trim()){
          req.session.flashData = {
            type: "danger",
            text: "Nama router wajib diisi untuk non-customers"
          };
          return res.redirect("/admin/add-new-onu");
        }
        finalRouterName = router_name.trim();
      }
  
      // Ambil info ODP
      const odp = await OdpModel.findById(odp_id);
      if (odp.used >= odp.capacity) {
        req.session.flashData = {
          type: "danger",
          text: "ODP sudah penuh, tidak bisa menambah ONU baru!"
        };
        return res.redirect("/admin/add-new-onu");
      }
      
      //ambil port olt, idport
      const authOnu = await OnuUnauthModel.getByMac(mac);
  
      // Insert ke tbl_onu
      const onuId = await OnuModel.create({
        nama: finalRouterName,
        lokasi: location,
        id_odp: odp_id,
        name_odp: odp ? odp.name : null,
        epon_port: authOnu.epon_port,
        onu_id: authOnu.onu_id,
        onu_mac: mac,
        status: "active"
      });
  
      // Kalau pelanggan, update tbl_pelanggan.onu_id = onuId
      if(usertype === "customers"){
        await PelangganModel.attachOnu(member_id, onuId);
      }
      
      //hapus onu unauth dan updaye odp
      if(onuId){
        await OnuUnauthModel.delete(mac);
        await OdpModel.updateUsed(odp.id, odp.used + 1);
      }
  
      req.session.flashData = {
        type: "success",
        text: "Router ONU berhasil ditambahkan"
      };
      res.redirect("/admin/router-onu");
  
    } catch (error) {
      console.error("Error prosessTambahOnu:", error);
      req.session.flashData = {
        type: "danger",
        text: "Gagal menambahkan router ONU"
      };
      res.redirect("/admin/add-new-onu");
    }
  }
  static async editOnu(req, res) {
    const { id } = req.params;
    const { hostname, no_internet, odp_id, location } = req.body;
  
    try {
      // cek data ONU
      const onu = await OnuModel.getById(id);
      if (!onu) {
        return res.status(404).json({
          success: false,
          message: "ONU tidak ditemukan"
        });
      }
      if (!odp_id) {
        return res.status(400).json({
          success: false,
          message: "ODP wajib dipilih"
        });
      }
  
      // cek ODP baru
      const odpBaru = await OdpModel.findById(odp_id);
      if (!odpBaru) {
        return res.status(404).json({
          success: false,
          message: "ODP tidak ditemukan"
        });
      }
  
      // kalau pindah ODP, cek kapasitas
      if (onu.id_odp !== odp_id && odpBaru.used >= odpBaru.capacity) {
        return res.status(400).json({
          success: false,
          message: "ODP sudah penuh"
        });
      }
  
      // update ONU
      const updated = await OnuModel.update(id, {
        nama: hostname,
        no_internet,
        lokasi: location,
        id_odp: odp_id
      });
  
      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Data ONU gagal diperbarui"
        });
      }
  
      // update usage ODP jika pindah
      if (onu.id_odp !== odp_id) {
        // kurangi dari ODP lama
        if (onu.id_odp) {
          const odpLama = await OdpModel.findById(onu.id_odp);
          if (odpLama && odpLama.used > 0) {
            await OdpModel.updateUsed(odpLama.id, odpLama.used - 1);
          }
        }
  
        // tambahkan ke ODP baru
        await OdpModel.updateUsed(odpBaru.id, odpBaru.used + 1);
      }
  
      // ambil data terbaru
      const newOnu = await OnuModel.getById(id);
  
      return res.json({
        success: true,
        message: "Data ONU berhasil diperbarui",
        data: newOnu
      });
    } catch (error) {
      console.error("Gagal Edit ONU:", error.message);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server"
      });
    }
  }
  static async deleteOnu(req, res) {
    const { id } = req.params;
    try {
      const onu = await OnuModel.getById(id);
      
      const pel = await PelangganModel.getOnuId(onu.id);
      if (pel) {
        await PelangganModel.updateOnuId(pel.id, null);
      }
      
      const odp = await OdpModel.findById(onu.id_odp);
      await OdpModel.updateUsed(odp.id, odp.used - 1);
      
      const result = await OnuModel.delete(onu.id);
      
      if (result.affectedRows > 0) {
        return res.json({
          success: true,
          message: "Data ONU berhasil dihapus",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Data ONU tidak ditemukan",
        });
      }
    } catch (error) {
      console.error("Gagal hapus ONU:", error.message);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }
  }
  
  
  static async detailOnu(req, res) {
    const { id } = req.params;
    try {
      const onu = await OnuModel.getById(id);
      if (!onu) {
        return res.status(404).json({ success: false, message: "ONU tidak ditemukan" });
      }
  
      // misalnya ambil info OLT dari tabel OLT ENV
      const oltConfig = {
        host: process.env.TELNET_HOST,
        port: process.env.TELNET_PORT,
        username: process.env.TELNET_USERNAME,
        password: process.env.TELNET_PASSWORD,
        prompt: "OLT_BIBITNET"
      };
  
      const result = await OltService.getOnuDetail(onu, oltConfig);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: "Gagal ambil data ONU", error: error.message });
    }
  }

}

module.exports = OnuController;