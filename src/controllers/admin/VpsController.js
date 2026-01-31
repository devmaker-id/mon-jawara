class VpsController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
// Dummy array (gantilah dengan data dari DB)
const servers = [
  { id: 1, name: "CHR-1", ip: "192.168.1.1", location: "Jakarta", provider: "Biznet" },
  { id: 2, name: "CHR-2", ip: "192.168.1.2", location: "Bandung", provider: "Indihome" },
  { id: 3, name: "CHR-3", ip: "192.168.1.3", location: "Surabaya", provider: "MyRepublic" },
  { id: 4, name: "CHR-4", ip: "192.168.1.4", location: "Jogja", provider: "Firstmedia" },
  { id: 5, name: "CHR-5", ip: "192.168.1.5", location: "Bali", provider: "XLHome" }
];


      
    res.render("vps-server/index", {
      title: "Vps Manajemen",
      servers,
      flashData
    });
  }
  
}

module.exports = VpsController;