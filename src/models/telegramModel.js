const db = require("../config/db");

class TelegramModel {
  
  static async insertData(params) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const inDb = `SELECT user_id FROM tbl_telegram WHERE user_id = ?`;
      const [ready] = await conn.query(inDb, [
        params.user_id
      ]);
      if (ready.length > 0) {
        throw new Error('Telegram token untuk user ini sudah ada.');
      }
      
      const insTele = `INSERT INTO tbl_telegram (user_id, token_bot, bot_id, bot_username, bot_name, webhook_url, last_checked) VALUES (?, ?, ?, ?, ?, ?, NOW())`;
  
      const [rows] = await conn.query(insTele, [
        params.user_id,
        params.token,
        params.bot_id,
        params.bot_username,
        params.bot_name,
        params.webhook_url,
      ]);
  
      if (rows.affectedRows === 0) {
        throw new Error('Gagal insert tbl_telegram');
      }
  
      const updateUser = `UPDATE tbl_users SET telegram_id = ? WHERE id = ?`;
      const [userResult] = await conn.query(updateUser, [
        rows.insertId,
        params.user_id
      ]);
      if (userResult.affectedRows === 0) {
        throw new Error('Gagal update telegram_id di tbl_users');
      }

      await conn.commit();
      return rows;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
  
  static async getById(id) {
    const [rows] = await db.query(
      "SELECT * FROM tbl_telegram WHERE id = ?", [id]
    );
    return rows[0];
  }
  
  static async getByToken(token) {
    const [rows] = await db.query(
      "SELECT id FROM tbl_telegram WHERE token_bot = ?", [token]
    );
    return !!rows[0]; //kebalikan bolean (true/false)
  }
  
  static async getByWebhook(salt) {
    const [rows] = await db.query(
      "SELECT * FROM tbl_telegram WHERE webhook_url = ?", [salt]
    );
    return rows;
  }
  
  static async findByUserId(id) {
    const [rows] = await db.query(
      "SELECT * FROM tbl_telegram WHERE user_id = ?", [id]
    );
    return rows[0];
  }
  
  static async updateWebhookStatus(id) {
    const [results] = await db.query("UPDATE tbl_telegram SET webhook_status = 1 WHERE id = ?", [id]);
    return results;
  }
  
  static async deleteTelegram(id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
  
      // Hapus dari tbl_telegram
      const [result] = await conn.query("DELETE FROM tbl_telegram WHERE id = ?", [id]);
  
      // Set telegram_id ke null di tbl_users
      await conn.query("UPDATE tbl_users SET telegram_id = NULL WHERE telegram_id = ?", [id]);
  
      await conn.commit();
      return result;
  
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateTelegramOwner(teleid, userid) {
    try {
      const sql = `UPDATE tbl_telegram SET telegram_id = ? WHERE user_id = ? AND webhook_status = 1`;
      const value = [teleid, userid];
      const [result] = await db.query(sql, value);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
}

module.exports = TelegramModel;