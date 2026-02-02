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

static async saveNewProduct(req, res) {
  try {
    let { kode_produk, nama, harga, stok, satuan, deskripsi, status } = req.body;

    // Normalisasi
    kode_produk = kode_produk?.trim() || null;
    nama = nama?.trim() || "";
    satuan = satuan?.trim() || null;
    deskripsi = deskripsi?.trim() || null;
    status = status && ["active", "inactive"].includes(status) ? status : "active";

    // Validasi
    const errors = [];
    if (!nama) errors.push("Nama produk wajib diisi.");
    if (!harga || isNaN(harga) || harga < 0) errors.push("Harga harus angka positif.");
    if (!stok || isNaN(stok) || stok < 0) errors.push("Stok harus angka positif.");

    if (errors.length > 0) {
      return res.json({ status: "error", message: errors.join(" ") });
    }

    // Data untuk DB
    const data = {
      kode_produk,
      nama,
      harga: parseInt(harga),
      stok: parseInt(stok),
      satuan,
      deskripsi,
      status
    };

    if (req.file) data.gambar = req.file.filename;

    const newId = await ModProducts.create(data); // sesuaikan dengan model kamu

    return res.json({
      status: "success",
      message: `Produk "${nama}" berhasil ditambahkan (ID: ${newId}).`
    });

  } catch (err) {
    console.error(err);
    return res.json({ status: "error", message: "Terjadi kesalahan saat menyimpan produk." });
  }
}


  static async updateProduct(req, res) {
  try {
    const { product_id, kode_produk, nama, harga, stok, satuan, deskripsi, status } = req.body;

    if (!nama || !harga || !stok) {
      return res.json({ status: "error", message: "Nama, harga, dan stok wajib diisi." });
    }

    const dataUpdate = {
      kode_produk: kode_produk?.trim() || null,
      nama: nama.trim(),
      harga: parseInt(harga),
      stok: parseInt(stok),
      satuan: satuan?.trim() || null,
      deskripsi: deskripsi?.trim() || null,
      status: status && ["active", "inactive"].includes(status) ? status : "active",
    };

    if (req.file) dataUpdate.gambar = req.file.filename; // update gambar jika ada

    await ModProducts.update(product_id, dataUpdate); // implementasi update sesuai model

    return res.json({ status: "success", message: `Produk "${nama}" berhasil diperbarui.` });
  } catch (err) {
    console.error(err);
    return res.json({ status: "error", message: "Terjadi kesalahan saat memperbarui produk." });
  }
}



}

module.exports = productController;
