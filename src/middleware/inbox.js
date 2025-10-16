// src/middleware/inbox.js
const InboxModel = require("../models/inboxModel");
const db = require("../config/db");

async function inboxMiddleware(req, res, next) {
  if (!req.session?.user) {
    res.locals.unreadCount = 0;
    res.locals.latestUnreadUserId = null;
    return next();
  }

  try {
    const userId = req.session.user.id;

    // Jumlah pesan belum dibaca
    const unreadCount = await InboxModel.getUnreadCount(userId);

    // Ambil user terakhir yang mengirim pesan belum dibaca
    const [rows] = await db.query(`
      SELECT sender_id 
      FROM tbl_messages
      WHERE receiver_id = ? AND status = 'unread'
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    res.locals.unreadCount = unreadCount;
    res.locals.latestUnreadUserId = rows[0]?.sender_id || null;

  } catch (err) {
    console.error("Inbox middleware error:", err);
    res.locals.unreadCount = 0;
    res.locals.latestUnreadUserId = null;
  }

  next();
}

module.exports = inboxMiddleware;
