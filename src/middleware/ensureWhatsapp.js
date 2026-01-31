const { isConnected } = require("../services/whatsappService");

module.exports = function ensureWhatsappConnected(req, res, next) {
  if (!isConnected()) {
    return res.redirect("/whatsapp/qr");
  }
  next();
};
