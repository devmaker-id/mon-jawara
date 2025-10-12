const ModProducts = require("../../models/productsModel");

class productController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    const products = await ModProducts.all();

    res.render("product/index", {
      title: "Produk Dashboard",
      products,
      flashData
    });
  }

  static async addNewProduct(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    res.render("product/add_new_product", {
      title: "Tambah Produk",
      flashData
    });
  }

  static async saveNewProduct(req, res) {
    try {
      // Ambil data dari form
      let { kode_produk, nama, harga, stok, satuan, deskripsi, status } = req.body;
      console.log(req.body);

      // tTrim & normalisasi nilai
      kode_produk = kode_produk?.trim() || null;
      nama = nama?.trim() || "";
      satuan = satuan?.trim() || null;
      deskripsi = deskripsi?.trim() || null;
      status = status && ["active", "inactive"].includes(status) ? status : "active";

      //  Validasi ringan
      const errors = [];
      if (!nama) errors.push("Nama produk wajib diisi.");
      if (!harga || isNaN(harga) || harga < 0) errors.push("Harga harus berupa angka positif.");
      if (!stok || isNaN(stok) || stok < 0) errors.push("Stok harus berupa angka positif.");

      // Jika error → kirim flash & redirect ke form
      if (errors.length > 0) {
        req.session.flashData = {
          type: "danger",
          text: errors.join(" "),
        };
        return res.redirect("/produk/tambah");
      }

      //  Siapkan data ke model
      const data = {
        kode_produk,
        nama,
        harga: parseInt(harga),
        stok: parseInt(stok),
        satuan,
        deskripsi,
        status,
      };

      //  Simpan ke DB
      const newId = await ModProducts.create(data);

      //  Flash sukses & redirect ke daftar produk
      req.session.flashData = {
        type: "success",
        text: `Produk "${nama}" berhasil ditambahkan (ID: ${newId}).`,
      };
      return res.redirect("/admin/products");

    } catch (error) {
      console.error("Error saving product:", error);

      req.session.flashData = {
        type: "danger",
        text: "Terjadi kesalahan saat menyimpan produk. Silakan coba lagi.",
      };
      return res.redirect("/admin/add_new_product");
    }
  }

}

module.exports = productController;
