const axios = require("axios");
const TelegramModel = require("../models/telegramModel");
const Bot = require("../utils/telegramBot");

class Webhook {
  static async handlerBot(req, res) {
    try {
      const salt = req.params.salt;
      const rows = await TelegramModel.getByWebhook(salt);

      if (rows.length === 0) {
        return res.status(400).json({ error: "Webhook tidak ditemukan" });
      }
      const bot = rows[0];
      const token = bot.token_bot;
      
      const update = req.body;
      //console.log("Received update:", update);
      
      if (update.message) {
        const chatId = update.message.chat.id;

        if (!update.message.text) {
          await Bot.sendMessage(
            token,
            chatId,
            "❌ Maaf, saya hanya bisa memproses pesan teks."
          );
          return res.sendStatus(200);
        }

        const text = update.message.text;
        await Webhook.processCommand(token, chatId, text);
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Error di handlerBot:", error);
      res.sendStatus(500);
    }
  }
  
  static async processCommand(token, chatId, text) {
    try {
      // Tambahkan logika pemrosesan perintah di sini
      const commandParts = text.split(" ");
      const command = commandParts[0].toLowerCase();
      
      if (command === "/start") {
        let msgTes = `👤 Hai saya JAWARA\n`;
        msgTes += `Berikut Telegram ID kamu\n`;
        msgTes += `ID: ${chatId}\n\n`;
        msgTes += `by Devmaker-ID`;

        await Bot.sendMessage(token, chatId, msgTes);
      } else {
        let chatListComm = "Bot Jawara Bibit. \n";
        chatListComm += "`/start` -> wilujeng sumping\n\n";
        chatListComm += "sys Jawara Bibit";
        await Bot.sendMessage(token, chatId, chatListComm);
      }
    } catch (error) {
      console.error("Error di processCommand:", error);
      await Bot.sendMessage(token, chatId, "❌ Terjadi kesalahan dalam memproses perintah.");
    }
  }
  
}

module.exports = Webhook;
