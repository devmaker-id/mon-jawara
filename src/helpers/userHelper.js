const dns = require("dns");
const UserModel = require("../models/userModel");

class UserHelper {

  static async generateUniqueUsername() {
    let username;
    let exists = true;

    while (exists) {
      const randomNumber = Math.floor(100000 + Math.random() * 900000);
      username = `jawara${randomNumber}`;
      const found = await UserModel.findByUsername(username);
      exists = !!found;
    }

    return username;
  }

  static async validateEmail(email) {
    // Regex dasar untuk validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { valid: false, reason: 'Format email tidak valid' };
    }

    // Cek MX record domain
    const domain = email.split('@')[1];
    return new Promise((resolve) => {
      dns.resolveMx(domain, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          return resolve({ valid: false, reason: `email tidak valid atau tidak bisa menerima ${email}` });
        }
        return resolve({ valid: true });
      });
    });
  }

}

module.exports = UserHelper;
