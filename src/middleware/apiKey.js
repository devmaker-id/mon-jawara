const UserModel = require("../models/userModel");

class ApiKey {
  static async validServerToServer(req, res, next) {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
        return res.status(401).json({ error: "API Key diperlukan" });
    }
    if (apiKey !== process.env.SERVER_KEY) {
        return res.status(403).json({ error: "API Key tidak valid" });
    }
    next();
  }
  
  static async validateApiKey(req, res, next) {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
      return res.status(401).json({ error: "API Key diperlukan" });
    }
    const user = await UserModel.findApiKey(apiKey);
    if (!user) {
      return res.status(403).json({ error: "API Key tidak valid" });
    }
    req.user = user;
    next();
  }

  static async generateApiKey() {
    const crypto = require("crypto");
    const apiKey = crypto.randomBytes(24).toString("hex");
    return apiKey;
  }
}

module.exports = ApiKey;
