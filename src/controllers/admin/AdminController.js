const UserModel = require("../../models/userModel");
class AdminController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const stats = {
      routerOnu: 24,
      odpPop: 18,
      olt: 4,
      pelanggan: 320,
      radius: 2,
      vpn: 3,
      income: {
        harian: 450000,
        mingguan: 2750000,
        bulanan: 10900000,
      }
    };
    
    res.render("admin/index", {
      title: "Pengaturan Umum",
      stats,
      flashData
    });
  }
  
  static async rolemgmn(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const roles = [
      { id: '1', name: 'administrator', permissions: ['akses_dashboard', 'kelola_user', 'kelola_pesan', 'kelola_nas'] },
      { id: '2', name: 'operator', permissions: ['akses_dashboard', 'kelola_pesan'] },
    ];

    res.render("admin/role-management", {
      title: "Aksess Manajement",
      roles,
      flashData
    });
  }
  
  static async mgmnUsers(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const allUsers = await UserModel.findAll();
    //console.log(allUsers);
    
    res.render("admin/mgmnUsers", {
      title: "Manajemen User",
      allUsers,
      flashData
    });
  }
  
  static async apiTelegram(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    res.render("admin/api-telegram", {
      title: "Api Telegram",
      flashData
    });
  }
  
}

module.exports = AdminController;