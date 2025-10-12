//pastikan user login
const ensureAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  req.user = req.session.user;
  const { fullname, telepon, alamat } = req.session.user;
  if (!fullname || !telepon || !alamat) {
    req.session.message = {
      type: "warning",
      text: "Lengkapi profil Anda untuk menggunakan semua fitur.",
    };
    return res.redirect("/user/profile");
  }

  next();
};

//role user: free, gold, vip, kasir, admin
// Khusus Administrator
const isAdmin = (req, res, next) => {
  if (req.session.user?.akun_type !== 'admin') {
    return res.redirect("/jawara");
  }
  next();
};

// Khusus VIP
const isVIP = (req, res, next) => {
  if (req.session.user?.akun_type !== 'vip') {
    return res.redirect("/jawara");
  }
  next();
};

// Khusus Kasir
const isKasir = (req, res, next) => {
  if (req.session.user?.akun_type !== 'kasir') {
    return res.redirect("/kasir"); // kalau bukan kasir, kembalikan ke menu umum
  }
  next(); // kalau kasir, lanjut
};

// gold atau vip
const isRegulerOrVIP = (req, res, next) => {
  const type = req.session.user?.akun_type;
  if (type === 'gold' || type === 'vip') return next();
  return res.redirect("/jawara");
};

module.exports = {
  ensureAuthenticated,
  isAdmin,
  isVIP,
  isKasir,
  isRegulerOrVIP
};