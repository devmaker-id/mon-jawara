const ejs = require("ejs");
const { prepareVoucherData } = require("../helpers/voucherHelper");
const userModel = require("../models/userModel");
const vcrModel = require("../models/voucherModel");
const profileGroup = require("../models/radiusd/profileGroupModel");
const tplModel = require("../models/tplModel");
const RadCheck = require("../models/radiusd/radcheck.model");
const RadUserGroup = require("../models/radiusd/radUserGroupModel");

class KartuVcrController {
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const profiles = await profileGroup.findByServiceType("HOTSPOT", req.user.id);
    const vouchers = await vcrModel.findAll();
    
    const templates = await tplModel.findAll();
    
    let owner;
    if(req.user.akun_type === "admin") {
      owner = await userModel.findAll();
    } else {
      owner = [req.user];
    }
    
    res.render("kartu-voucher/index", {
      title: "Kartu Voucher",
      owner,
      profiles,
      vouchers,
      templates,
      flashData,
    });
  }

  static async generateBulkVouchers(req, res) {
    const db = require("../config/db");
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const {
        jumlah,
        panjang,
        kombinasi,
        type,
        owner_id,
        profile,
        prefix = "",
      } = req.body;

      if (!jumlah || !panjang || !kombinasi || !type || !owner_id || !profile) {
        return res.status(400).json({
          success: false,
          message: "Data tidak lengkap.",
        });
      }

      // ===== OWNER =====
      let owner;
      if (req.user.akun_type === "admin") {
        owner = await userModel.findById(owner_id);
      } else {
        owner = req.user;
      }

      // ===== PROFILE =====
      const dbProf = await profileGroup.findById(profile);

      // ===== GENERATE VOUCHER =====
      const vouchers = prepareVoucherData({
        total: Number(jumlah),
        codeLength: Number(panjang),
        passLength: Number(panjang),
        kombinasi: Number(kombinasi),
        type,
        prefix,
        serviceType: dbProf.service_type,
        profilegroup: dbProf.groupname,
        harga_beli: dbProf.harga_modal,
        price: dbProf.harga_jual,
        durasi: dbProf.durasi,
        owner_id: owner.id,
        owner_username: owner.username,
      });

      // ===== INSERT VOUCHER (BUSINESS DB) =====
      await vcrModel.bulkCreate(vouchers, conn);

      // ===== INSERT KE RADIUS =====
      for (const v of vouchers) {
        // radcheck (password)
        await RadCheck.setPassword(
          v.code,
          v.secret,
          conn
        );

        // radusergroup (profile)
        await RadUserGroup.create(
          {
            username: v.code,
            groupname: v.profilegroup,
          },
          conn
        );
      }

      await conn.commit();

      return res.status(200).json({
        success: true,
        message: `${vouchers.length} voucher berhasil dibuat.`,
      });
    } catch (error) {
      await conn.rollback();
      console.error("Gagal generate voucher:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal generate voucher (rollback).",
      });
    } finally {
      conn.release();
    }
  }

  static async printVoucher(req, res) {
    try {
      const { mode } = req.query;
      let vouchers = [];

      if (mode === "selected") {
        const ids = (req.query.ids || "")
          .split(",")
          .map(Number)
          .filter(Boolean);

        vouchers = await vcrModel.findByIds(ids);
      }

      else if (mode === "latest") {
        vouchers = await vcrModel.findLatest(req.query.limit);
      }

      else if (mode === "filter") {
        vouchers = await vcrModel.findFiltered({
          tanggal: req.query.tanggal,
          profile: req.query.profile,
          owner_id: req.query.owner_id
        });
      }

      else {
        return res.status(400).send("Mode cetak tidak valid");
      }

      if (!vouchers.length) {
        return res.send("Tidak ada data voucher");
      }

      return res.render("kartu-voucher/print", {
        title: "Cetak Voucher",
        vouchers
      });

    } catch (err) {
      console.error("printVoucher error:", err);
      return res.status(500).send("Server error");
    }
  }
  
  static async cetakFiltered(req, res) {
    try {
      const { tanggal, profile, owner_id, template_id, output } = req.query;
  
      const template = await tplModel.getById(template_id);
      if (!template) return res.send("Template tidak ditemukan");
  
      // Ambil voucher sesuai filter
      const vouchers = await vcrModel.findFiltered({ tanggal, profile, owner_id });
  
      if (!vouchers.length) return res.send("Tidak ada voucher untuk dicetak.");
      
      function getColorByPrice(price) {
        if (!price) return 'gray';
        const clean = parseInt(price.toString().replace(/\D/g, ''));
        if (clean >= 20000) return 'darkgreen';
        if (clean >= 10000) return 'teal';
        if (clean >= 7000) return 'orange';
        if (clean >= 5000) return 'orangered';
        return 'gray';
      }

  
      // Render setiap voucher satu per satu
      const rendered = vouchers.map((v, index) => {
        return ejs.render(template.html, {
          v,
          index,
          domain: "http://bibit.net",
          userType: v.type || "VOUCHER",
          getColorByPrice
        });
      }).join(""); // Gabungkan semuanya
  
      if (output === "pdf") {
        // Kamu bisa lanjutkan dengan export ke PDF pakai Puppeteer/html-pdf di sini
        return res.send("Export PDF coming soon...");
      }
  
      // Preview HTML langsung untuk cetak
      res.send(`
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Preview Cetak Voucher</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="author" content="Devmaker-ID" />
            <link rel="icon" type="image/png" href="/tower.png" />
      
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.0.12/index.css" />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
            <link rel="stylesheet" href="/css/adminlte.css" />
      
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      
            <style>
              * {
                box-sizing: border-box;
              }
      
              body {
                font-family: "Source Sans 3", sans-serif;
                margin: 0;
                padding: 10px;
              }
      
              .print-container {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
              }
      
              .voucher {
                width: 5cm;
                height: 2cm;
                padding: 5px;
                border: 1px solid #ccc;
                border-left: 0.4cm solid orange;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                page-break-inside: avoid;
                overflow: hidden;
              }
      
              .voucher small {
                font-size: 8px;
                color: #555;
              }
      
              @media print {
                body {
                  margin: 0;
                }
      
                .voucher {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body onload="window.print()">
            <div class="print-container">
              ${rendered}
            </div>
          </body>
        </html>
      `);

    } catch (err) {
      console.error(err);
      res.status(500).send("Gagal generate cetak.");
    }
  }


  
  static async templateVcr(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const templates = await tplModel.findAll();
    
    res.render("kartu-voucher/template", {
      title: "Template Voucher",
      templates,
      flashData,
    });
  }
  
  static async addTemplate(req, res) {
    try {
      const { name, statusTemplate, templateEngine } = req.body;
      const user = req.user;
  
      if (!name || !templateEngine) {
        return res.status(400).json({ success: false, message: "Nama dan template harus diisi." });
      }
  
      const timestamp = new Date();
  
      await tplModel.insert({
        name,
        status: statusTemplate,
        html: templateEngine,
        owner_id: user.id,
        owner_username: user.username,
        created_at: timestamp,
        updated_at: timestamp,
      });
  
      req.session.flashData = { type: 'success', text: 'Template berhasil ditambahkan.' };
      return res.redirect("/kartu-voucher/template");
    } catch (error) {
      console.error("Gagal tambah template:", error.message);
      req.session.flashData = { type: 'danger', text: 'Gagal menambah template.' };
      return res.redirect("/kartu-voucher/template");
    }
  }


  static async previewTpl(req, res) {
    try {
      const id = req.params.id;
  
      const template = await tplModel.getById(id);
      if (!template) {
        return res.status(404).send("Template tidak ditemukan");
      }
      //console.log(template);
      
      function getColorByPrice(price) {
        if (!price) return 'gray';
        const clean = parseInt(price.toString().replace(/\D/g, ''));
        if (clean >= 20000) return 'darkgreen';
        if (clean >= 10000) return 'teal';
        if (clean >= 7000) return 'orange';
        if (clean >= 5000) return 'orangered';
        return 'gray';
      }
  
      const tplHtml = template.html;
      let renderedHTML = "";

    // 🟡 Tambah 5 data VOUCHER
    for (let i = 0; i < 5; i++) {
      const dummyData = {
        v: {
          code: `user${i + 1}`,
          secret: `pass${i + 1}`,
          price: "2000",
          duration: "4 jam, 1 hari"
        },
        domain: "http://bibit.net",
        userType: "VOUCHER",
        index: i + 1,
        getColorByPrice
      };
    
      const html = await ejs.render(tplHtml, dummyData);
      renderedHTML += html;
    }
    
    // 🟢 Tambah 5 data MEMBER
    for (let i = 0; i < 5; i++) {
      const dummyData = {
        v: {
          code: `member${i + 1}`,
          secret: `pw${i + 1}`,
          price: "10000",
          duration: "1 bulan"
        },
        domain: "http://bibit.net",
        userType: "MEMBER",
        index: 5 + i + 1, // Lanjut dari index terakhir (5)
        getColorByPrice
      };
    
      const html = await ejs.render(tplHtml, dummyData);
      renderedHTML += html;
    }

  
      res.send(renderedHTML);
    } catch (error) {
      console.error("Preview error:", error);
      res.status(500).send("Gagal menampilkan preview template");
    }
  }
  
  static async updateTemplate(req, res) {
    const id = req.params.id;
    const { name, html, status } = req.body;
  
    try {
      const template = await tplModel.getById(id);
      if (!template) return res.status(404).json({ message: 'Template tidak ditemukan.' });
  
      await tplModel.update(id, { name, html, status });
      res.status(200).json({ message: 'Update sukses.' });
    } catch (err) {
      console.error('Update error:', err.message);
      res.status(500).json({ message: 'Gagal update template.' });
    }
  }

  
  static async deleteTemplate(req, res) {
    const id = req.params.id;
  
    try {
      const existing = await tplModel.getById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Template tidak ditemukan.' });
      }
  
      await tplModel.delete(id);
      return res.status(200).json({ message: 'Template dihapus.' });
    } catch (error) {
      console.error('Delete error:', error.message);
      return res.status(500).json({ message: 'Gagal menghapus template.' });
    }
  }

  
}

module.exports = KartuVcrController;