const { Client } = require("ssh2");

class SSHInspector {
  constructor({ host, port = 22, username, password }) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;

    this.conn = new Client();
    this.timeoutHit = false;
    this.timer = null;
  }

  inspect() {
    return new Promise((resolve, reject) => {
      // ⏱ timeout manual
      this.timer = setTimeout(() => {
        this.timeoutHit = true;
        this.conn.end();
        reject("Timeout: server tidak merespon (host / firewall / port SSH)");
      }, 7000);

      this.conn.on("ready", async () => {
        clearTimeout(this.timer);

        try {
          // 🖥 OS INFO (optional, tidak bikin gagal)
          let os = "Unknown";
          try {
            const osRaw = await this.exec("cat /etc/os-release");
            os = this.parseOS(osRaw);
          } catch (_) {}

          // 📡 FREERADIUS INFO (optional)
          let radius = { installed: false, active: false };
          try {
            const raw = await this.exec(
              "systemctl is-active freeradius || systemctl is-active radiusd"
            );
            radius = {
              installed: true,
              active: raw.trim() === "active"
            };
          } catch (_) {}

          this.conn.end();

          resolve({
            connected: true,
            os,
            radius
          });

        } catch (err) {
          this.conn.end();
          reject(err);
        }
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

  exec(command) {
    return new Promise((resolve, reject) => {
      this.conn.exec(command, (err, stream) => {
        if (err) return reject("Gagal menjalankan perintah");

        let stdout = "";
        let stderr = "";

        stream
          .on("close", () => {
            if (stderr) reject(stderr);
            else resolve(stdout);
          })
          .on("data", d => (stdout += d.toString()))
          .stderr.on("data", d => (stderr += d.toString()));
      });
    });
  }

  /* ================= PARSER ================= */

  parseOS(raw) {
    const match = raw.match(/^PRETTY_NAME="(.+)"$/m);
    return match ? match[1] : "OS tidak terdeteksi";
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

module.exports = SSHInspector;