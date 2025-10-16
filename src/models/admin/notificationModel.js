const db = require("../../config/db");

class NotificationModel {
  // Admin: buat notifikasi baru (personal / broadcast)
  static async create({ title, message, icon, link, target_user_id = null }) {
    const target = target_user_id === "" ? null : target_user_id;
    await db.query(`
      INSERT INTO tbl_notifications (title, message, icon, link, target_user_id)
      VALUES (?, ?, ?, ?, ?)
    `, [title, message, icon, link, target]);
  }

  // Admin: ambil semua notifikasi (baru dulu)
  static async getAll() {
    const [rows] = await db.query(`
      SELECT n.*, u.username AS target_name
      FROM tbl_notifications n
      LEFT JOIN tbl_users u ON n.target_user_id = u.id
      ORDER BY n.created_at DESC
    `);
    return rows;
  }

  // User: ambil notifikasi untuk user (personal + broadcast)
  static async getForUser(userId) {
    const [rows] = await db.query(`
      SELECT n.*, IF(r.id IS NULL, 0, 1) AS is_read
      FROM tbl_notifications n
      LEFT JOIN tbl_notification_reads r
        ON n.id = r.notification_id AND r.user_id = ?
      WHERE n.target_user_id IS NULL OR n.target_user_id = ?
      ORDER BY n.created_at DESC
    `, [userId, userId]);
    return rows;
  }

  // User: tandai sudah dibaca
  static async markAsRead(notificationId, userId) {
    const [exist] = await db.query(`
      SELECT id FROM tbl_notification_reads
      WHERE notification_id = ? AND user_id = ?
    `, [notificationId, userId]);

    if (exist.length === 0) {
      await db.query(`
        INSERT INTO tbl_notification_reads (notification_id, user_id)
        VALUES (?, ?)
      `, [notificationId, userId]);
    }
  }

  // Admin/User: hapus notifikasi
  static async delete(id) {
    await db.query(`DELETE FROM tbl_notifications WHERE id = ?`, [id]);
  }
}

module.exports = NotificationModel;
