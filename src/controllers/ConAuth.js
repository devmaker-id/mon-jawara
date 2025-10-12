const UserHelper = require("../helpers/userHelper");
const UserModel = require("../models/userModel");

// Menampilkan halaman login
exports.loginPage = async (req, res) => {
  const message = req.session.message;
  delete req.session.message;

  res.render("login", {
    title: "Login Panel Jawara",
    layout: false,
    message,
  });
};

// Proses login
exports.loginProcess = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.verifLoginUser(username, password);
    
    if (!user) {
      return res.render("login", {
        title: "Login Panel Jawara",
        layout: false,
        message: {
          type: 'danger',
          text: "Username atau password salah"
        }
      });
    }
    
    const { password: _, ...safeUser } = user;
    req.session.user = safeUser;
    // 🔑 arahkan sesuai akun_type
    if (safeUser.akun_type === "admin") {
      return res.redirect("/admin");
    } else if (safeUser.akun_type === "kasir") {
      return res.redirect("/kasir");
    } else {
      return res.redirect("/jawara"); // default untuk role lain
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

// Halaman register
exports.registerPage = (req, res) => {
  const message = req.session.message;
  delete req.session.message;
  
  res.render("daftar", {
    title: "Register",
    layout: false,
    message,
  });
};

// Proses register
exports.registerProcess = async (req, res) => {
  const { email, password, confpass } = req.body;
  if (!email || !password || !confpass) {
    req.session.message = {
      type: "danger",
      text: "Input tidak lengakap.",
    };
    return res.redirect("/auth/daftar");
  }
  if (password !== confpass) {
    req.session.message = {
      type: "danger",
      text: "Konfirmasi password tidak sama.",
    };
    return res.redirect("/auth/daftar");
  }
  const emailCheck = await UserHelper.validateEmail(email);
  if(!emailCheck.valid){
    req.session.message = {
      type: "danger",
      text: emailCheck.reason,
    };
    return res.redirect("/auth/daftar");
  }
  
  // Generate username unik
  const username = await UserHelper.generateUniqueUsername();
  
  try {
    // Cek apakah username sudah ada
    const userExists = await UserModel.getByEmail(email);
    if (userExists) {
      req.session.message = {
        type: "danger",
        text: "Email sudah terdaftar.",
      };
      return res.redirect("/auth/daftar");
    }
    
    // Hash password sebelum disimpan
    const bcrypt = require("bcryptjs");
    const { generateApiKey } = require("../middleware/apiKey");
    const { sendConfirmationEmail } = require("../helpers/emailHelper");
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = await generateApiKey();
    
    const params = {
      username: username,
      password: hashedPassword,
      email: email,
      apiKey: apiKey,
    };
    
    const inUser = await UserModel.insertUser(params);
    if(!inUser) {
      req.session.message = {
        type: "danger",
        text: "Terjadi kesalahan saat pendaftaran USER DB.",
      };
      return res.redirect("/auth/daftar");
    }
    
    const origin = req.get('origin');
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = origin || `${protocol}://${host}`;
    
    await sendConfirmationEmail(baseUrl, email, username, apiKey);
    
    req.session.message = {
      type: "success",
      text: `Pendaftaran berhasil, silahkan cek email. ${email} lakukan konfirmasi`,
    };
    
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Register Error:", error);
    req.session.message = {
      type: "danger",
      text: "Terjadi kesalahan saat registrasi.",
    };
    res.redirect("/auth/daftar");
  }
};

//verifikasi email pake api key
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  
  try {
    const user = await UserModel.findApiKey(token);
    if (!user) return res.redirect("/auth/login");

    const isVerified = await UserModel.verifyUser(token);
    if (!isVerified) {
      req.session.message = {
        type: "danger",
        text: "Token tidak valid atau sudah diverifikasi.",
      };
    }
    // Kirim email setelah verifikasi berhasil
    const { sendAfterVerifyEmail } = require("../helpers/emailHelper");
    await sendAfterVerifyEmail(user.email, user.username);

    req.session.message = {
      type: "success",
      text: "Trimakasih telah memverifikasi.",
    };
    return res.redirect("/auth/login");
  } catch (error) {
    req.session.message = {
      type: "danger",
      text: "Terjadi kesalahan internal.",
    };
    return res.redirect("/auth/login");
  }
  
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
};
