// utils/olt/telnetHisfocus.js — refined by Devmaker & ChatGPT (v2.5 Global)
const net = require("net");

class TelnetClient {
  constructor(options = {}) {
    this.socket = new net.Socket();
    this.promptConsole = options.promptConsole || "OLT";
    this.oltHost = options.host;
    this.oltPort = options.port;
    this.oltUsername = options.username;
    this.oltPassword = options.password;

    this.buffer = "";
    this.isLoggedIn = false;
    this.isUsernameSent = false;
    this.isPasswordSent = false;
    this.commandQueue = [];
    this.isCommandRunning = false;
    this.responseCallback = null;

    this._loginStatusHandled = false;
    this.commandTimeout = options.commandTimeout || 5000; // default 5 detik
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.oltPort, this.oltHost, () => {
        console.log(`[TELNET] Connected to ${this.oltHost}`);
      });

      this.socket.setEncoding("ascii");
      this.socket.on("data", (data) => this.handleData(data, resolve, reject));
      this.socket.on("error", (err) => {
        if (!this._loginStatusHandled) {
          this._loginStatusHandled = true;
          reject({
            success: false,
            message: "NETWORK_ERROR",
            data: err.message,
          });
        }
      });
      this.socket.on("close", () => console.log("[TELNET] Connection closed"));

      this._timeout = setTimeout(() => {
        if (!this._loginStatusHandled) {
          this._loginStatusHandled = true;
          reject({
            success: false,
            message: "CONNECTION_TIMEOUT",
            data: "OLT tidak merespons dalam batas waktu",
          });
          this.socket.destroy();
        }
      }, 10000);
    });
  }

  handleData(data, resolve, reject) {
    this.buffer += data.toString();

    // === LOGIN FLOW ===
    if (!this.isUsernameSent && /Username:/.test(this.buffer)) {
      this.socket.write(this.oltUsername + "\r\n");
      this.isUsernameSent = true;
      this.buffer = "";
      return;
    }

    if (this.isUsernameSent && !this.isPasswordSent && /Password:/.test(this.buffer)) {
      this.socket.write(this.oltPassword + "\r\n");
      this.isPasswordSent = true;
      this.buffer = "";
      return;
    }

    // Deteksi prompt console login berhasil
    const promptRegex = new RegExp(`${this.promptConsole}[>#]`);
    if (!this.isLoggedIn && promptRegex.test(this.buffer)) {
      console.log("[TELNET] Login success, session ready");
      this.isLoggedIn = true;
      this.buffer = "";

      if (!this._loginStatusHandled) {
        this._loginStatusHandled = true;
        clearTimeout(this._timeout);
        resolve({
          success: true,
          message: "LOGIN_SUCCESS",
          data: null,
        });
      }
      return;
    }

    if (/Incorrect passwd!/.test(this.buffer)) {
      console.log("[TELNET] Login failed: wrong password");
      this.socket.end();
      if (!this._loginStatusHandled) {
        this._loginStatusHandled = true;
        clearTimeout(this._timeout);
        reject({
          success: false,
          message: "LOGIN_FAILED",
          data: "Incorrect password",
        });
      }
      return;
    }

    // === COMMAND EXECUTION ===
    if (this.isCommandRunning && this.responseCallback) {
      if (promptRegex.test(this.buffer.trim())) {
        const result = this.buffer;
        this.buffer = "";
        this.isCommandRunning = false;

        clearTimeout(this._timeout);

        setTimeout(() => {
          this.responseCallback(this._formatResponse(result));
          this.responseCallback = null;
        }, 150);
      }
    }

    // Jalankan antrian command berikutnya
    if (this.isLoggedIn && this.commandQueue.length > 0 && !this.isCommandRunning) {
      this.executeNextCommand();
    }
  }

  sendCommand(command) {
    return new Promise((resolve) => {
      this.commandQueue.push({
        command,
        callback: (response) => resolve(response),
      });

      if (this.isLoggedIn && !this.isCommandRunning) {
        this.executeNextCommand();
      }
    });
  }

  executeNextCommand() {
    if (this.commandQueue.length === 0) return;

    this.isCommandRunning = true;
    const { command, callback } = this.commandQueue.shift();
    console.log(`[TELNET] Executing: ${command}`);
    this.socket.write(command + "\r\n");
    this.responseCallback = callback;

    this._timeout = setTimeout(() => {
      if (this.isCommandRunning) {
        this.isCommandRunning = false;
        if (this.responseCallback) {
          this.responseCallback({
            success: false,
            message: "COMMAND_TIMEOUT",
            data: `No response for command: ${command}`,
          });
          this.responseCallback = null;
        }
      }
    }, this.commandTimeout);
  }

  // 🔧 Universal Key:Value Parser
  _formatResponse(response) {
    const lines = response.split("\n").map(l => l.trim()).filter(Boolean);
    const json = {};
    lines.forEach(line => {
      const match = line.match(/^(.+?)\s*:\s*(.+)$/);
      if (match) {
        const key = match[1].trim().replace(/\s+/g, "_").toLowerCase();
        json[key] = match[2].trim();
      }
    });
    return { success: true, data: json, raw: response };
  }

  async saveConfigOlt() {
    await this.sendCommand("enable");
    await this.sendCommand("write");
    return { success: true, message: "Config saved" };
  }

  disconnect() {
    try {
      this.socket.write("exit\r\n");
      this.socket.end();
    } catch (e) {
      console.warn("[TELNET] Forced close:", e.message);
    }
  }
  
  parseNetworkOlt(response) {
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let data = {};
    let currentSection = null;

    for (let line of lines) {
      if (line.endsWith("network:")) {
        currentSection = line.replace(" network:", "").toLowerCase();
        data[currentSection] = {};
      } else {
        let match = line.match(/^(.+?)\s+:\s+(.+)$/);
        if (match && currentSection) {
          let key = match[1].trim().replace(/\s+/g, "_").toLowerCase();
          let value = match[2].trim();
          data[currentSection][key] = value;
        }
      }
    }
    return data;
  }

  parseOnuInfo(response) {
    if (typeof response !== "string") {
      return { success: false, message: "Invalid response", data: null };
    }
  
    const lines = response
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("OLT_"));
  
    const result = {};
    for (let line of lines) {
      const match = line.match(/^(.+?)\s+:\s+(.+)$/);
      if (match) {
        const key = match[1]
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        const value = match[2].trim();
        result[key] = value;
      }
    }
  
    return {
      success: true,
      message: "Parsed successfully",
      data: result
    };
  }
  parseOpticalInfo(response) {
    if (typeof response !== "string") {
      return { success: false, message: "Invalid response", data: null };
    }
  
    const lines = response
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("OLT_"));
  
    const result = {};
    for (let line of lines) {
      const match = line.match(/^(.+?)\s+:\s+(.+)$/);
      if (match) {
        const key = match[1]
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");
        const value = match[2].trim();
        result[key] = value;
      }
    }
  
    // convert ke tipe data lebih bermakna
    const formatted = {
      temperature: parseFloat(result.temperature),
      voltage: parseFloat(result.voltage),
      tx_bias: parseFloat(result.txbias),
      tx_power: parseFloat(result.txpower),
      rx_power: parseFloat(result.rxpower),
      temperature_unit: "°C",
      voltage_unit: "V",
      power_unit: "dBm"
    };
  
    return {
      success: true,
      message: "Parsed successfully",
      data: formatted
    };
  }
  _safeParseLines(response) {
    return response
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("OLT_"));
  }

}

module.exports = TelnetClient;
