const NotificationModel = require("../../models/admin/notificationModel");

class NotificationController {
  // Admin: daftar semua notifikasi
  static async index(req, res) {
    try {
      const notifications = await NotificationModel.getAll();
      res.render("notifications/admin_index", {
        layout: "layouts/main",
        title: "Manajemen Notifikasi",
        notifications,
      });
    } catch (err) {
      console.error("❌ Gagal load notifikasi:", err.message);
      res.status(500).send("Gagal memuat data notifikasi.");
    }
  }

  // Admin: buat baru
  static async create(req, res) {
    try {
      const { title, message, icon, link, target_user_id } = req.body;
      await NotificationModel.create({ title, message, icon, link, target_user_id });
      res.redirect("/admin/notifications");
    } catch (err) {
      console.error("❌ Gagal buat notifikasi:", err.message);
      res.status(500).send("Gagal membuat notifikasi.");
    }
  }

  // Admin: hapus
  static async delete(req, res) {
    try {
      await NotificationModel.delete(req.params.id);
      res.redirect("/admin/notifications");
    } catch (err) {
      console.error("❌ Gagal hapus notifikasi:", err.message);
      res.status(500).send("Gagal menghapus notifikasi.");
    }
  }

  // User: lihat semua notifikasi
  static async userIndex(req, res) {
    try {
      const userId = req.session.user.id;
      const notifications = await NotificationModel.getForUser(userId);
      res.render("notifications/user_index", {
        layout: "layouts/main",
        title: "Notifikasi Saya",
        notifications,
      });
    } catch (err) {
      console.error("❌ Gagal load notifikasi user:", err.message);
      res.status(500).send("Gagal memuat notifikasi.");
    }
  }

  // User: tandai sudah dibaca (AJAX)
  static async markRead(req, res) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      await NotificationModel.markAsRead(id, userId);
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Gagal tandai dibaca:", err.message);
      res.json({ success: false });
    }
  }
}

module.exports = NotificationController;
