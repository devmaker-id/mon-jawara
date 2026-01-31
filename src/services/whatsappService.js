const fs = require("fs");
const path = require("path");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const sessionPath = path.join(__dirname, "../../session");

/* =======================
   STATE GLOBAL
======================= */
let sock = null;
let qrCode = null;
let waState = "IDLE"; 
// IDLE | INIT | QR | CONNECTED

/* =======================
   INIT WHATSAPP
======================= */
async function initWA() {
  if (waState !== "IDLE") {
    console.log("⛔ Init ditolak, state:", waState);
    return;
  }

  waState = "INIT";
  console.log("🚀 Init WhatsApp...");

  const { state, saveCreds } = await useMultiFileAuthState("./session");

  // matikan socket lama kalau ada
  if (sock) {
    try { sock.end(); } catch {}
    sock = null;
  }

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  /* =======================
     CONNECTION UPDATE
  ======================= */
  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      qrCode = qr;
      waState = "QR";
      console.log("📲 QR READY");
    }

    if (connection === "open") {
      qrCode = null;
      waState = "CONNECTED";
      console.log("✅ WA CONNECTED");
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;

      qrCode = null;
      waState = "IDLE";

      // 🔥 NORMAL setelah pairing
      if (code === 515) {
        console.log("🔁 Restart after pairing...");
        setTimeout(initWA, 1500);
        return;
      }

      if (code === DisconnectReason.loggedOut) {
        console.log("🚪 SESSION INVALID → scan ulang");
        return;
      }

      console.log("⚠️ WA closed:", code);
      setTimeout(initWA, 2000);
    }
  });

  /* =======================
     MESSAGE HANDLER
  ======================= */
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    console.log("📩", from, ":", text);

    if (text.toLowerCase() === "halo") {
      await sock.sendMessage(from, { text: "Halo 👋 ini bot otomatis" });
    }

    if (text.toLowerCase() === "ping") {
      await sock.sendMessage(from, { text: "pong 🏓" });
    }
  });
}

/* =======================
   HELPERS
======================= */
function getSocket() {
  return sock;
}
function hasSession() {
  return fs.existsSync(sessionPath);
}

function isConnected() {
  return waState === "CONNECTED";
}

function getQR() {
  return qrCode;
}

function getInfo() {
  if (!sock || waState !== "CONNECTED") return null;

  return {
    jid: sock.user?.id?.split(":")[0],
    name: sock.user?.name || "-",
    platform: sock.user?.platform || "unknown"
  };
}

/* =======================
   SEND MESSAGE
======================= */
async function sendMessage(phone, message) {
  if (!isConnected()) {
    throw new Error("WhatsApp belum terhubung");
  }

  let jid;

  if (phone.includes("@")) {
    jid = phone; // sudah jid lengkap
  } else {
    jid = phone.replace(/\D/g, "") + "@s.whatsapp.net";
  }

  await sock.sendMessage(jid, { text: message });
  return true;
}


/* =======================
   LOGOUT
======================= */
async function logoutWA() {
  if (!sock) return;

  try {
    await sock.logout();
  } catch {}

  sock = null;
  qrCode = null;
  waState = "IDLE";

  console.log("🚪 WA LOGOUT");
}

module.exports = {
  initWA,
  logoutWA,
  getSocket,
  isConnected,
  getQR,
  getInfo,
  sendMessage,
  hasSession
};
