const db = require("../config/db");

async function notificationMiddleware(req, res, next) {
  res.locals.notifications = [];
  res.locals.notifUnreadCount = 0;

  if (!req.session?.user) return next();

  try {
    const userId = req.session.user.id;

    const [notifications] = await db.query(`
      SELECT n.id, n.title, n.message, n.icon, n.link, n.created_at,
             IF(r.id IS NULL, 0, 1) AS is_read
      FROM tbl_notifications n
      LEFT JOIN tbl_notification_reads r
        ON n.id = r.notification_id AND r.user_id = ?
      WHERE n.target_user_id IS NULL OR n.target_user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 5
    `, [userId, userId]);

    const notifUnreadCount = notifications.filter(n => !n.is_read).length;

    res.locals.notifications = notifications;
    res.locals.notifUnreadCount = notifUnreadCount;
  } catch (err) {
    console.error("❌ notificationMiddleware error:", err.message);
  }

  next();
}

module.exports = notificationMiddleware;
