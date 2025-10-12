const axios = require("axios");

class TelegramBot {
  static async sendMessage(token, chatId, text) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;

      const response = await axios.post(
        url,
        {
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
        },
        {
          timeout: 5000, // Tambahkan timeout 5 detik
        }
      );

      return response.data;
    } catch (error) {
      const errResponse = error.response?.data || {
        ok: false,
        description: error.message || "Terjadi kesalahan tidak diketahui"
      };
  
      // Pastikan tetap return objek seperti response.data
      return {
        ok: false,
        error_code: error.response?.status || 500,
        description: errResponse.description
      };
    }
  }
}

module.exports = TelegramBot;