/**
 * Middleware setLocale
 * - Menjamin session user tetap tersedia
 * - Mengatur bahasa (default: 'id')
 * - Menyediakan helper global untuk EJS
 */

module.exports = function setLocale(req, res, next) {
  try {
    // Pastikan ada objek session
    if (!req.session) req.session = {};

    // Simpan user login (kalau ada)
    if (req.session.user) {
      res.locals.user = req.session.user;
    } else {
      res.locals.user = null;
    }

    // Bahasa default (bisa diubah di future)
    const defaultLocale = 'id';
    res.locals.locale = req.session.locale || defaultLocale;

    // URL aktif
    res.locals.currentUrl = req.originalUrl;

    // Helper format tanggal agar konsisten
    res.locals.formatDate = function (date) {
      if (!date) return '';
      return new Date(date).toLocaleString(res.locals.locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    next();
  } catch (err) {
    console.error('❌ setLocale middleware error:', err);
    res.locals.user = null;
    res.locals.locale = 'id';
    next();
  }
};
