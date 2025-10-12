const net = require("net");

class TelnetClient {
  constructor(options = {}) {
    this.socket = new net.Socket();
    this.promptConsole = options.promptConsole || "OLT_JAWARA";
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
  }

  connect() {
    return new Promise((resolve, reject) => {
      this._loginStatusHandled = false;
      
      this.socket.connect(this.oltPort, this.oltHost, () => {
        console.log(`TELNET Connected ${this.oltHost}`);
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
      this.socket.on("close", () => console.log("Koneksi Telnet ditutup"));
      this.loginCallback = resolve;
      
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

    if (!this.isUsernameSent && /Username:/.test(this.buffer)) {
      this.socket.write(this.oltUsername + "\r\n");
      this.isUsernameSent = true;
      this.buffer = "";
    } else if (
      this.isUsernameSent &&
      !this.isPasswordSent &&
      /Password:/.test(this.buffer)
    ) {
      this.socket.write(this.oltPassword + "\r\n");
      this.isPasswordSent = true;
      this.buffer = "";
    } else if (!this.isLoggedIn) {
      console.log("Terminal Telnet Terbuka...");
      this.isLoggedIn = true;
      this.buffer = "";
      if (this.loginCallback) this.loginCallback();
        if (!this._loginStatusHandled) {
        this._loginStatusHandled = true;
        clearTimeout(this._timeout);
        resolve({
          success: true,
          message: "LOGIN_SUCCESS",
          data: null,
        });
      }
    } else if (/Incorrect passwd!/.test(this.buffer)) {
      console.log("Password salah! Menutup koneksi...");
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
    } else if (this.isCommandRunning) {
      if ( />$|#$/.test(this.buffer.trim()) ) {
        if (this.responseCallback) {
          const result = this.buffer;
          this.buffer = "";
          this.isCommandRunning = false;
    
          clearTimeout(this._timeout);
    
          // Tambah delay dikit buat pastiin data lengkap
          setTimeout(() => {
            this.responseCallback(result);
            this.responseCallback = null;
          }, 100); // 100ms atau bisa 200ms
        }
      }
    }

    if (
      this.isLoggedIn &&
      this.commandQueue.length > 0 &&
      !this.isCommandRunning
    ) {
      this.executeNextCommand();
    }
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      this.commandQueue.push({
        command,
        callback: (response) => {
          resolve(response);
        },
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
    console.log(`<- Write Command: ${command}`);
    this.socket.write(command + "\r\n");

    this.responseCallback = callback;

    setTimeout(() => {
      if (this.isCommandRunning) {
        this.isCommandRunning = false;
        if (this.responseCallback) {
          this.responseCallback("TimeOUT Next perintah, OLT Ga respon");
          this.responseCallback = null;
        }
      }
    }, 3000);
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
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    let data = {};

    for (let line of lines) {
      let match = line.match(/^(.+?)\s+:\s+(.+)$/);
      if (match) {
        let key = match[1].trim().replace(/\s+/g, "_").toLowerCase();
        let value = match[2].trim();
        data[key] = value;
      }
    }
    return data;
  }

  parseOpticalInfo(response) {
    const lines = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    let opticalData = {};

    for (let line of lines) {
      let match = line.match(/^(.+?)\s+:\s+(.+)$/);
      if (match) {
        let key = match[1].trim().replace(/\s+/g, "_").toLowerCase();
        let value = match[2].trim();
        opticalData[key] = value;
      }
    }

    return {
      temperature: opticalData.temperature,
      voltage: opticalData.voltage,
      txbias: opticalData.txbias,
      txpower: opticalData.txpower,
      rxpower: opticalData.rxpower,
    };
  }
  
  parseSystemInfo(response) {
    const lines = response
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("Current configuration:"));
  
    const result = {};
  
    for (let line of lines) {
      const match = line.match(/^(.+?)\s+:\s+(.+)$/);
      if (match) {
        const key = match[1].trim().replace(/\s+/g, "_").toLowerCase(); // "MAC" => "mac", "Revision Date" => "revision_date"
        const value = match[2].trim();
        result[key] = value;
      }
    }
  
    return result;
  }


  saveConfigOlt() {
    this.sendCommand("enable");
    this.sendCommand("write");
    setTimeout(() => {
      this.sendCommand("exit");
    }, 5000); // waktu tunggu olt save config 3-5 detik saya set di 5 detik
  }

  disconnect() {
    this.socket.end();
  }
}

module.exports = TelnetClient;