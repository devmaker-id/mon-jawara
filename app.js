require("dotenv").config();
process.env.TZ = process.env.TZ || "Asia/Jakarta"; // Set default timezone jika belum ada di .env

const express = require("express");
const path = require("path");
const session = require("express-session"); // Tambahkan session
const expressLayouts = require("express-ejs-layouts");
const AuthRoute = require("./src/routes/auth");
const setLocals = require("./src/middleware/setLocals");
const Administrator = require("./src/routes/admin");
const KasirRoute = require("./src/routes/kasir");

//helpers
const { rupiah } = require("./src/helpers/formatter");

//Api Route
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

const app = express();

// 1. Set 'trust proxy' agar Express tahu bahwa ia bekerja di balik proxy (misalnya Nginx)
app.set('trust proxy', true);

// 2. Middleware untuk session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "S3cr3tM0n1t0rJ4w4r4B161T", // Gunakan secret dari .env atau default value
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookies hanya digunakan di produksi (https)
      httpOnly: true, // Prevent XSS attacks by preventing JavaScript from accessing cookies
      maxAge: 60 * 60 * 1000, // Set session cookie untuk 1 jam
    },
  })
);
// 2.A Refresh session expiration on each request if the user is active
app.use((req, res, next) => {
  if (req.session) {
    req.session._garbage = Date();
    req.session.touch();
  }
  next();
});


// setelah session setup & session.touch middleware
app.use(setLocals);

//helper send view
app.locals.rupiah = rupiah;

// 3. Middleware untuk menangkap data form
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Middleware untuk menerima JSON payload

// 4. Mengatur EJS sebagai template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// 5. Gunakan express-ejs-layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");

// 6. Middleware untuk file statis (CSS, JS, gambar)
app.use(express.static(path.join(__dirname, "src", "public")));

// 7. Routing folder untuk autentikasi dan dashboard
app.use("/auth", AuthRoute); // Menggunakan route autentikasi
app.use("/jawara", DashboardRoute); // Menggunakan route dashboard

app.use("/api", ApiRoute); // api routes

//Administrator Role
app.use("/admin", Administrator);
//Kasir Role
app.use("/kasir", KasirRoute);

app.use("/bot", WebhookRoute); // webhook dinamis
app.use("/telegram", TeleRoute);
app.use("/oltmgmn", OltRoute);
app.use("/mikrotik", MikrotikRoute);
app.use("/vpn", VpnRoute);
app.use("/mikhmon", MikhmonRoute);
app.use("/log", LogRoute);

//user routing profile
app.use("/user", UserRoute);

// 8. Middleware 404: Halaman Tidak Ditemukan
app.use((req, res) => {
  res.redirect("/jawara"); // Arahkan ke /jawara jika tidak ada route yang cocok
});

// 9. Menjalankan server
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
