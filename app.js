require("dotenv").config();
process.env.TZ = process.env.TZ || "Asia/Jakarta"; // Set default timezone jika belum ada di .env

const express = require("express");
const path = require("path");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const multer = require("multer"); // untuk upload PLN bukti (disiapkan di sini agar bisa global)

// Routes
const AuthRoute = require("./src/routes/auth");
const setLocals = require("./src/middleware/setLocals");
const inboxMiddleware = require('./src/middleware/inbox');
const notificationMiddleware = require('./src/middleware/notification');
const Administrator = require("./src/routes/admin");
const KasirRoute = require("./src/routes/kasir");
const ApiRoute = require("./src/routes/apiRoutes");
const TeleRoute = require("./src/routes/telegram");
const OltRoute = require("./src/routes/olt");
const MikrotikRoute = require("./src/routes/mikrotik");
const VpnRoute = require("./src/routes/vpn");
const WebhookRoute = require("./src/routes/webhook");
const DashboardRoute = require("./src/routes/dashboardRoute");
const MikhmonRoute = require("./src/routes/mikhmon");
const LogRoute = require("./src/routes/log");
const UserRoute = require("./src/routes/user");
const InboxRoute = require("./src/routes/inboxRoutes");
const NotifRoute = require("./src/routes/notifRoutes");

const WhatsappRoute = require("./src/routes/whatsappRoutes");
const { initWA } = require("./src/services/whatsappService");


// Helpers
const { rupiah } = require("./src/helpers/formatter");

const app = express();

// --------------------------------------------------
// 1. Trust proxy (penting jika pakai Nginx/Cloudflare)
app.set("trust proxy", 1);

// --------------------------------------------------
// 2. Setup Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "S3cr3tM0n1t0rJ4w4r4B161T",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // hanya aktif di HTTPS
      httpOnly: true, // cegah akses JS ke cookie
      sameSite: "lax", // hindari CSRF ringan
      maxAge: 60 * 60 * 1000, // 1 jam
    },
  })
);

// --------------------------------------------------
// 3. Refresh session expiry per request aktif
app.use((req, res, next) => {
  if (req.session) {
    req.session._garbage = Date();
    req.session.touch();
  }
  next();
});

// 4.a Middleware Inbox
app.use(inboxMiddleware);
// 4.b
app.use(notificationMiddleware);

// --------------------------------------------------
// 4. Set Locals (flash message, user data, dll)
app.use(setLocals);

// --------------------------------------------------
// 5. Helpers global (rupiah, formatter, dll)
app.locals.rupiah = rupiah;

// --------------------------------------------------
// 6. Middleware parsing data form dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --------------------------------------------------
// 7. View engine EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Layouts (gunakan layouts/main.ejs sebagai base)
app.use(expressLayouts);
app.set("layout", "layouts/main");

// --------------------------------------------------
// 8. Static files (CSS, JS, Uploads)
app.use(express.static(path.join(__dirname, "src", "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // penting untuk PLN upload bukti

// --------------------------------------------------
// 9. Routing setup
app.use("/auth", AuthRoute);
app.use("/jawara", DashboardRoute);
app.use("/api", ApiRoute);
app.use("/admin", Administrator);
app.use("/kasir", KasirRoute);
app.use("/bot", WebhookRoute);
app.use("/telegram", TeleRoute);
app.use("/oltmgmn", OltRoute);
app.use("/mikrotik", MikrotikRoute);
app.use("/vpn", VpnRoute);
app.use("/mikhmon", MikhmonRoute);
app.use("/log", LogRoute);
app.use("/user", UserRoute);
app.use("/inbox", InboxRoute);
app.use("/notifications", NotifRoute);
app.use("/whatsapp", WhatsappRoute);


// --------------------------------------------------
// 10. Middleware 404 Redirect
app.use((req, res) => {
  res.redirect("/jawara");
});

// --------------------------------------------------
// 11. Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
