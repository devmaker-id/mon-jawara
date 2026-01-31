const axios = require("axios");
const validator = require("validator");
const TelegramModel = require("../models/telegramModel");
const Bot = require("../utils/telegramBot");

class TelegramController {

  static async index(req, res) {
    const dayjs = require('dayjs');
    require('dayjs/locale/id'); // import locale Indonesia
    dayjs.locale('id');         // aktifkan locale

    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const user = req.session.user;
    const telegram = await TelegramModel.findByUserId(user.id);
    
    if(telegram) {
      //jika telegram ditemukan ubah format created_at
      telegram.created_at_formatted = dayjs(telegram.created_at)
      .format('DD MMMM YYYY HH:mm:ss');
    }
    
    res.render("telegram/index", {
        title: "Telegram Dashboard",
        telegram,
        flashData,
      });
  }

  static async addTokenTelegram(req, res) {
    try {
      const crypto = require("crypto");
      const {token } = req.body;
      
      if (!token) {
        req.session.flashData = {
          type: "danger",
          text: "Token ga boleh kosong",
        };
        return res.redirect("/telegram");
      }
      
      const exis = await TelegramModel.getByToken(token);
      if(exis){
        req.session.flashData = {
          type: "danger",
          text: `Token ini Gabisa kamu pake: ${token}`,
        };
        return res.redirect("/telegram");
      }
      
      const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);

      if (!response.data.ok) {
        req.session.flashData = {
          type: "danger",
          text: "Token ga Valid",
        };
      return res.redirect("/telegram");
      }
      const infoBot = response.data.result;
      const salt = crypto.randomUUID();
      const user = req.session.user;
      const data = {
        user_id: user.id,
        token: token,
        token: token,
        bot_id: infoBot.id,
        bot_username: infoBot.username,
        bot_name: infoBot.first_name,
        webhook_url: salt
      };
      
      const rows = await TelegramModel.insertData(data);
      if(!rows.affectedRows) {
        req.session.flashData = {
          type: "danger",
          text: "Gagal menyimpan data Telegram",
        };
      return res.redirect("/telegram");
      }

      req.session.flashData = {
        type: "success",
        text: "Berhasil tambah Telegram",
      };
      return res.redirect("/telegram");
    } catch (error) {
      //handler untuk token telegram jika error
      if(error.response.data){
        req.session.flashData = {
          type: "danger",
          text: "Token tidak valid",
        };
      } else {
        req.session.flashData = {
          type: "danger",
          text: error.message || "Terjadi kesalahan saat menyimpan data Telegram",
        };
      }
      return res.redirect("/telegram");
    }
  }

  static async deleteTelegram(req, res) {
    try {
      const { id } = req.body;
      const tele = await TelegramModel.getById(id);
      
      const url = `https://api.telegram.org/bot${tele.token_bot}/deleteWebhook`;
      const response = await axios.post(url);
      
      console.log("DELETE: ", response.data);
      
      const result = await TelegramModel.deleteTelegram(id);
  
      if (result.affectedRows === 0) {
        req.session.flashData = {
          type: "danger",
          text: "Data Telegram tidak ditemukan atau sudah dihapus.",
        };
      } else {
        req.session.flashData = {
          type: "success",
          text: "Telegram berhasil dihapus.",
        };
      }
  
      return res.redirect("/telegram");
  
    } catch (error) {
      console.error("Delete Webhook Error:", error.message);
      req.session.flashData = {
        type: "danger",
        text: "Gagal menghapus Webhook Telegram.",
      };
      return res.redirect("/telegram");
    }
  }
  
  static async setWebhookTelegram(req, res) {
    try {
      const { id } = req.body;
      const origin = req.get('origin');
      const protocol = req.protocol;
      const host = req.get('host');
      const result = await TelegramModel.getById(id);
      
      const isHttps = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https';
      if (!isHttps) {
        return res.status(400).json({
          success: false,
          text: `Domain webhook harus HTTPS`,
        });
      }
      
      const baseUrl = origin || `${protocol}://${host}`;
      const domain = `${baseUrl}/bot/${result.webhook_url}`;
      
      const response = await axios.post(`https://api.telegram.org/bot${result.token_bot}/setWebhook`, {
        url: domain
      });
      
      await TelegramModel.updateWebhookStatus(id);

      //console.log("webhook\n", response.data);
      
      return res.json({
        success: true,
        text: response.data.description,
      });
    } catch (error) {
      console.error(error.response?.data);
      if(!error.response.data.ok){
        const tele = error.response?.data;
        return res.status(tele.error_code).json({
          success: false,
          text: tele.description,
        });
      } else {
        return res.status(500).json({
          success: false,
          text: "Gagal set webhook backend",
        });
      }
    }
  }
  
  static async addOwnerTeleId(req, res) {
    const { teleid } = req.body;
    const userid = req.session.user.id;
    if (!teleid && !userid) {
      return res.status(404).json({
        status: false,
        msg: "data tidak lengkap"
      });
    }
    if (!validator.isInt(teleid.toString(), { min: 10000 })) {
      return res.status(203).json({
        status: false,
        msg: "Telegram ID tidak valid"
      });
    }
    try {
      //coba kirim tes ke telegram id yang di input
      const dbTele = await TelegramModel.findByUserId(userid);
      const response = await Bot.sendMessage(
        dbTele.token_bot,
        teleid,
        `Tes Monitor Jawara, OK`
      );

      if(!response.ok) {
        return res.status(400).json({
          success: false,
          msg: "Id telegram tidak valid"
        });
      }
      
      const teleUpdate = await TelegramModel.updateTelegramOwner(teleid, userid);
      if(!teleUpdate) {
        return res.status(203).json({
          status: false,
          msg: "gagal menyimpan id telegram, periksa webhook apakah sudah diaktifkan.",
        });
      }
      
      return res.status(200).json({
        success: true,
        msg: "berhasil menambah id owner"
      });
    } catch (error) {
      throw error;
      return res.status(500).json({
        status: false,
        msg: "Terjadi kesalahan server"
      });
    }
  }

}

module.exports = TelegramController;
