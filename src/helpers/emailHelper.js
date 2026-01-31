const nodemailer = require('nodemailer');

// Buat transporter dengan SMTP server dari domain kamu
const transporter = nodemailer.createTransport({
  host: 'bibitnet.web.id', // SMTP server dari domain kamu
  port: 465, // Port SMTP untuk SSL
  secure: true, // Menggunakan SSL
  auth: {
    user: 'jawara@bibitnet.web.id', // Email pengirim
    pass: 'MonJawara2710!@' // Password email pengirim
  }
});

// Fungsi untuk mengirim email konfirmasi
async function sendConfirmationEmail(baseUrl, toEmail, username, token) {
  const verifyUrl = `${baseUrl}/auth/verify?token=${token}`; // Ganti dengan URL yang sesuai jika sudah live

  const mailOptions = {
    from: '"Mon-Jawara" <jawara@bibitnet.web.id>', // Pengirim email
    to: toEmail,
    subject: 'Konfirmasi Pendaftaran',
    html: `<p>Halo sobat Jawara,</p>
           <p>Terima kasih sudah mendaftar. Silakan klik link berikut untuk verifikasi akun Anda:</p>
           <a href="${verifyUrl}">${verifyUrl}</a>
           <hr>
           <i>anda tidak perlu membalas email ini...</i>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email terkirim!');
  } catch (error) {
    console.error('Gagal kirim email:', error);
    throw error;
  }
}

//fungsi memberitahu bahwa akun telah terferifikasi
async function sendAfterVerifyEmail(toEmail, username) {
  const mailOptions = {
    from: '"Mon-Jawara" <jawara@bibitnet.web.id>',
    to: toEmail,
    subject: 'Selamat, akun Anda telah terverifikasi!',
    html: `<p>Halo ${username},</p>
           <p>Akun Anda dengan email <strong>${toEmail}</strong> berhasil diverifikasi.</p>
           <p>Untuk menggunakan semua fitur, silakan lengkapi profil Anda sekarang</p>
           <hr>
           <i>Terima kasih telah bergabung bersama kami.</i>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email lanjutan terkirim!');
  } catch (error) {
    console.error('Gagal kirim email lanjutan:', error);
  }
}

module.exports = { sendConfirmationEmail, sendAfterVerifyEmail };
