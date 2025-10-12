// mon-jawara/src/middleware/setLocals.js
module.exports = (req, res, next) => {
  // user dari session
  res.locals.user = req.session?.user || null;

  // Jika kamu mau menaruh default dummy, gunakan session dulu jika ada
  res.locals.messages = req.session?.messages || [
    { name: "Brad Diesel", text: "Call me whenever you can...", time: "4 jam lalu", img: "/assets/img/user1-128x128.jpg", badge: "text-danger" },
    { name: "John Pierce", text: "I got your message bro", time: "6 jam lalu", img: "/assets/img/user8-128x128.jpg", badge: "text-secondary" },
    { name: "Nora Silvester", text: "The subject goes here", time: "1 hari lalu", img: "/assets/img/user3-128x128.jpg", badge: "text-warning" }
  ];

  res.locals.notifications = req.session?.notifications || [
    { icon: "bi-envelope", text: "2 pesan baru", time: "5 mnt" },
    { icon: "bi-people-fill", text: "1 permintaan teman", time: "1 jam" },
    { icon: "bi-file-earmark-fill", text: "Laporan sistem masuk", time: "3 jam" },
    { icon: "bi-exclamation-triangle", text: "Kesalahan login", time: "kemarin" },
    { icon: "bi-download", text: "File berhasil diunggah", time: "2 hari" },
  ];

  next();
};
