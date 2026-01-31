// src/controllers/DashboardController.js

exports.dashboardPage = (req, res) => {
  res.render("index", {
    title: "Dashboard",
    user: req.session.user, // Mengirim data user ke halaman dashboard
  });
};
