const { Client } = require("ssh2");

class SSHConnectionChecker {
  constructor({ host, port = 22, username, password }) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;

    this.conn = new Client();
    this.timeoutHit = false;
    this.timer = null;
  }

  check() {
    return new Promise((resolve, reject) => {
      // ⏱ timeout manual (network / firewall / host down)
      this.timer = setTimeout(() => {
        this.timeoutHit = true;
        this.conn.end();
        reject("Timeout: server tidak merespon (host / firewall / port SSH)");
      }, 7000);

      this.conn.on("ready", () => {
        clearTimeout(this.timer);
        this.conn.end();
        resolve(true); // ✅ SSH OK
      });

      this.conn.on("error", (err) => {
        clearTimeout(this.timer);
        reject(this.mapError(err));
      });

      this.connect();
    });
  }

  /* ================= CORE ================= */

  connect() {
    this.conn.connect({
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,

      // Ubuntu 22.04 / first connect
      tryKeyboard: true,

      // auto accept host key (setara ketik "yes")
      hostVerifier: () => true,

      readyTimeout: 6000
    });
  }

  /* ================= ERROR MAP ================= */

  mapError(err) {
    if (this.timeoutHit)
      return "Timeout: server tidak dapat dijangkau";

    if (err.level === "client-authentication")
      return "Autentikasi gagal: username atau password salah";

    if (err.code === "ECONNREFUSED")
      return "Koneksi ditolak: port SSH tertutup atau service mati";

    if (err.code === "ENOTFOUND")
      return "Host tidak ditemukan";

    if (err.code === "EHOSTUNREACH")
      return "Host tidak dapat dijangkau";

    if (err.message?.toLowerCase().includes("handshake"))
      return "Handshake SSH gagal: host key atau algoritma tidak kompatibel";

    return "Gagal koneksi SSH";
  }
}

module.exports = SSHConnectionChecker;