const ModOlt = require("../../models/admin/oltModel");

class OltController {

  static async oltBrand(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const oltbrand = await ModOlt.brandAll();
    
    res.render("olt-mgmn/type-olt", {
      title: "Olt Brand Type",
      oltbrand,
      flashData
    });
  }

  // POST /admin/oltbrand/add
  static async addNewBrand(req, res) {
    try {
      const { name, status, keterangan } = req.body;

      if (!name || !status) {
        return res.json({ success: false, message: 'Nama dan status wajib diisi.' });
      }

      const result = await ModOlt.addBrand({ name, status, keterangan });

      if(result.affectedRows > 0) {
        return res.json({ success: true, message: 'Brand berhasil ditambahkan.' });
      } else {
        return res.json({ success: false, message: 'Gagal menyimpan brand.' });
      }
    } catch (err) {
      console.error('Error addNewBrand:', err);
      return res.json({ success: false, message: 'Terjadi kesalahan server.' });
    }
  }
  
  // Controller: OltController.js
  static async editBrand(req, res) {
    try {
      const { id } = req.params;
      const { name, status, keterangan } = req.body;
  
      // Validasi minimal
      if (!id || !name || !status) {
        return res.json({
          success: false,
          message: 'ID, nama, dan status wajib diisi.'
        });
      }
  
      // Update ke database
      const result = await ModOlt.updateBrand(id, { name, status, keterangan });
  
      if (result.affectedRows > 0) {
        return res.json({
          success: true,
          message: 'Brand berhasil diperbarui.'
        });
      } else {
        return res.json({
          success: false,
          message: 'Tidak ada perubahan atau brand tidak ditemukan.'
        });
      }
  
    } catch (err) {
      console.error('Error editBrand:', err);
      return res.json({
        success: false,
        message: 'Terjadi kesalahan server.'
      });
    }
  }


  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const brands = await ModOlt.brandAll();
    const olts = await ModOlt.all();
    console.log(olts);
    
    res.render("olt-mgmn/index", {
      title: "List Olt",
      brands,
      olts,
      flashData
    });
  }

  static async tambahBaru(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    res.render("olt-mgmn/tambah-olt", {
      title: "Tambah Olt Baru",
      flashData
    });
  }

  // Ambil data OLT by id
  static async getById(req, res) {
    const id = req.params.id;
    try {
      const olt = await ModOlt.getById(id);
      if(olt) {
        res.json({ success: true, data: olt });
      } else {
        res.json({ success: false, message: 'OLT tidak ditemukan' });
      }
    } catch(err) {
      console.error(err);
      res.json({ success: false, message: 'Terjadi kesalahan server' });
    }
  }

  // Tambah OLT
  static async addNewOlt(req, res) {
    try {
      const data = req.body;
      await ModOlt.add(data);
      res.json({ success: true });
    } catch(err) {
      console.error(err);
      res.json({ success: false, message: err.message || 'Gagal menambahkan OLT' });
    }
  }
  
// Edit OLT
  static async editOlt(req, res) {
    const id = req.params.id;
    try {
      const data = req.body;
      await ModOlt.update(id, data);
      res.json({ success: true });
    } catch(err) {
      console.error(err);
      res.json({ success: false, message: err.message || 'Gagal update OLT' });
    }
  }

  // Hapus OLT
  static async deleteOlt(req, res) {
    const id = req.params.id;
    try {
      await ModOlt.delete(id);
      res.json({ success: true });
    } catch(err) {
      console.error(err);
      res.json({ success: false, message: err.message || 'Gagal hapus OLT' });
    }
  }

}

module.exports = OltController;
