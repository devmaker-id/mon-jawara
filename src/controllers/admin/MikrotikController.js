class MikrotikController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    res.render("admin/mikrotik/index", {
      title: "Manajemen Mikrotik Client",
      flashData
    });
  }
  
}

module.exports = MikrotikController;