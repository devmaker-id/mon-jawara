// src/models/inboxModel.js
const db = require("../config/db");

class InboxModel {

  // List semua percakapan user
  static async getConversationList(userId) {
    const [rows] = await db.query(`
      SELECT 
        u.id AS user_id,
        u.username,
        u.fullname,
        u.avatar,
        MAX(m.created_at) AS last_message_time,
        SUBSTRING_INDEX(m.body, ' ', 10) AS last_message,
        SUM(CASE WHEN m.receiver_id = ? AND m.status='unread' THEN 1 ELSE 0 END) AS unread_count
      FROM tbl_messages m
      JOIN tbl_users u 
        ON (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END) = u.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY u.id, u.username, u.fullname, u.avatar
      ORDER BY last_message_time DESC
    `, [userId, userId, userId, userId]);
    return rows;
  }

  // Pesan dari satu percakapan
  static async getConversationMessages(userId, otherUserId) {
    const [rows] = await db.query(`
      SELECT 
        m.id, m.sender_id, m.receiver_id, m.body, m.status, m.created_at
      FROM tbl_messages m
      WHERE (m.sender_id=? AND m.receiver_id=?) OR (m.sender_id=? AND m.receiver_id=?)
      ORDER BY m.created_at ASC
    `, [userId, otherUserId, otherUserId, userId]);
    return rows;
  }

  // Tandai percakapan sebagai dibaca
  static async markConversationAsRead(userId, otherUserId) {
    await db.query(`
      UPDATE tbl_messages
      SET status='read', read_at=NOW()
      WHERE sender_id=? AND receiver_id=? AND status='unread'
    `, [otherUserId, userId]);
  }

  // Kirim pesan
  static async sendMessage(senderId, receiverId, subject, body) {
    await db.query(`
      INSERT INTO tbl_messages (sender_id, receiver_id, subject, body)
      VALUES (?, ?, ?, ?)
    `, [senderId, receiverId, subject, body]);
  }

  // Hitung pesan belum dibaca
  static async getUnreadCount(userId) {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM tbl_messages
      WHERE receiver_id=? AND status='unread'
    `, [userId]);
    return rows[0].total;
  }

  // Semua user kecuali diri sendiri (untuk chat baru)
  static async getAllOtherUsers(userId) {
    const [rows] = await db.query(`
      SELECT id, username, fullname, avatar
      FROM tbl_users
      WHERE id<>?
    `, [userId]);
    return rows;
  }
}

module.exports = InboxModel;
