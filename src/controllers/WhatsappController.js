const fs = require("fs");
const path = require("path");

const { initWA, logoutWA, isConnected, getQR, getSocket, getInfo, sendMessage, hasSession } = require("../services/whatsappService");

const ModKontakWa = require("../models/whatsapp/kontakModel");

class waBot {
  static async index(req, res) {
    res.render("whatsapp/index", {
      title: "Manajement Whatsapp"
    })
  }

  static async kontak(req, res) {
    const message = req.session.flashData;
    delete req.session.flashData;

    const kontaks = await ModKontakWa.getAll();

    res.render("whatsapp/kontak", {
      title: "Manajement Allowed Kontak",
      kontaks,
      message
    })
  }

  static async tambahKontak(req, res) {
    const { jid, name } = req.body;

    try {
      const already = await ModKontakWa.getJid(jid);
      if (already) {
        req.session.flashData = {
          type: "danger",
          text: "Nomor telepon telah terdaftar",
        };
        return res.redirect("/whatsapp/kontak");
      }

      await ModKontakWa.create(jid, name);

      req.session.flashData = {
        type: "success",
        text: "Berhasil menambah kontak",
      };
      return res.redirect("/whatsapp/kontak");
    } catch (err) {
      console.error(err);
      throw err;
    }

  }

  static async editKontak(req, res) {
    const { id, jid, name } = req.body;
    try {
      // Cek JID unik, kecuali id ini sendiri
      const already = await ModKontakWa.getJid(jid);
      if (already && already.id != id) {
        req.session.flashData = {
          type: "danger",
          text: "Nomor telepon telah terdaftar",
        };
        return res.redirect("/whatsapp/kontak");
      }

      const upt = await ModKontakWa.update(id, jid, name);
      if (upt.changedRows) {
        req.session.flashData = {
          type: "success",
          text: "Kontak berhasil di update",
        };
        return res.redirect("/whatsapp/kontak");
      }

      req.session.flashData = {
        type: "secondary",
        text: "Tidak ada perubahan",
      };
      return res.redirect("/whatsapp/kontak");
    } catch (err) {
      console.error(err.message);
      req.session.flashData = {
        type: "danger",
        text: "Terjadi kesalahan system",
      };
      return res.redirect("/whatsapp/kontak");
    }
  }

  static async hapusKontak(req, res) {
    const { id } = req.params;
    try {
      await ModKontakWa.delete(id);
      req.session.flashData = {
        type: "success",
        text: "Kontak berhasil di HAPUS!!",
      };
      return res.redirect("/whatsapp/kontak");
    } catch (err) {
      console.error(err.message);
      req.session.flashData = {
        type: "danger",
        text: "Terjadi kesalahan system",
      };
      return res.redirect("/whatsapp/kontak");
    }
  }

  static async tesKirimPesan(req, res) {
    const { id } = req.params;
    try {
      const kontak = await ModKontakWa.getId(id);
      if (!kontak) {
        req.session.flashData = {
          type: "danger",
          text: "Kontak kaga ada lur!",
        };
        return res.redirect("/whatsapp/kontak");
      }

      const phone = kontak.jid;
      await sendMessage(phone, "halo halo, punten bro. disini monjawa.xyz cek pesan!!!");

      req.session.flashData = {
        type: "success",
        text: "Pesan berhasil dikirim, w gapeduli nomor itu terdaftar atau belum di whatsapp",
      };
      return res.redirect("/whatsapp/kontak");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }


  static async qrPage(req, res) {
    res.render("whatsapp/qr", {
      title: "Bot WhatsApp"
    });
  }

  static async status(req, res) {
    // ⛳ AUTO INIT JIKA:
    // - belum connect
    // - belum init
    // - ADA session
    //console.log(getInfo());

    if (!isConnected() && hasSession()) {
      await initWA();
    }

    res.json({
      connected: isConnected(),
      state: "CONNECTED",
      qr: getQR(),
      info: getInfo()
    });
  }

  static qrData(req, res) {
    res.json({
      connected: isConnected(),
      qr: getQR()
    });
  }

  static async init(req, res) {
    try {
      await initWA();
      res.json({ success: true });
    } catch (err) {
      res.json({ success: false, message: err.message });
    }
  }

  static async logout(req, res) {
    try {
      const sock = getSocket();
      if (sock) {
        await logoutWA();
      }
      // hapus session
      fs.rmSync(path.join(__dirname, "../../session"), {
        recursive: true,
        force: true
      });

      res.json({
        success: true
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async send(req, res) {
    try {
      if (!isConnected()) {
        return res.status(400).json({ message: "WhatsApp belum terhubung" });
      }

      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({ message: "Nomor & pesan wajib diisi" });
      }

      await sendMessage(phone, message);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
  
}


module.exports = waBot;
