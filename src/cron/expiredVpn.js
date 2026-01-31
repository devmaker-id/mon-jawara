const cron = require("node-cron");
const db = require("../config/db"); // sesuaikan dengan file koneksi db-mu

// Cron: setiap hari jam 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    const [result] = await db.query(`
      UPDATE tbl_akun_vpn 
      SET status = 'expired' 
      WHERE expired_at <= NOW() AND status = 'active'
    `);
    console.log(`[CRON] VPN expired update: ${result.affectedRows} akun di-set expired`);
  } catch (error) {
    console.error("[CRON] Gagal update VPN expired:", error.message);
  }
});
