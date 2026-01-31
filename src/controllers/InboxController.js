// src/controllers/inboxController.js
const InboxModel = require("../models/inboxModel");

class InboxController {

  // Halaman utama inbox
  static async index(req, res) {
    try {
      const userId = req.session.user.id;

      // List percakapan
      const conversations = await InboxModel.getConversationList(userId);

      // List semua user untuk chat baru
      const allUsers = await InboxModel.getAllOtherUsers(userId);

      res.render("inbox/index", {
        layout: "layouts/main",
        title: "Kotak Masuk",
        conversations,
        messages: [],
        activeChat: null,
        allUsers
      });

    } catch (err) {
      console.error("❌ Gagal load inbox:", err);
      res.status(500).send("Gagal memuat inbox.");
    }
  }

  // Lihat percakapan dengan user lain
  static async chat(req, res) {
    try {
      const userId = req.session.user.id;
      const otherId = req.params.id;

      // Tandai pesan sebagai dibaca
      await InboxModel.markConversationAsRead(userId, otherId);

      const [conversations, messages] = await Promise.all([
        InboxModel.getConversationList(userId),
        InboxModel.getConversationMessages(userId, otherId)
      ]);

      res.render("inbox/index", {
        layout: "layouts/main",
        title: "Percakapan",
        conversations,
        messages,
        activeChat: otherId,
        allUsers: await InboxModel.getAllOtherUsers(userId)
      });

    } catch (err) {
      console.error("❌ Gagal load chat:", err);
      res.status(500).send("Gagal memuat percakapan.");
    }
  }

  // JSON endpoint untuk AJAX
  static async chatJSON(req, res) {
    try {
      const userId = req.session.user.id;
      const otherId = req.params.id;

      const messages = await InboxModel.getConversationMessages(userId, otherId);

      res.json({ success: true, messages });

    } catch (err) {
      console.error("❌ JSON chat error:", err);
      res.json({ success: false, messages: [] });
    }
  }

  // Kirim pesan
  static async send(req, res) {
    try {
      const senderId = req.session.user.id;
      const { receiver_id, body } = req.body;
      if (!receiver_id || !body) return res.status(400).send("Data tidak lengkap");

      await InboxModel.sendMessage(senderId, receiver_id, "Pesan", body);

      // Jika AJAX request, kembalikan success
      if (req.headers['content-type'] === 'application/json') {
        return res.json({ success: true, body });
      }

      res.redirect(`/inbox/chat/${receiver_id}`);
    } catch (err) {
      console.error("❌ Gagal kirim pesan:", err);
      res.status(500).send("Gagal mengirim pesan.");
    }
  }
}

module.exports = InboxController;
