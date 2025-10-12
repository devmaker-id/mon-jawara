class OltController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const olts = [
      { id: 1, nama: 'OLT Jakarta 1', ip: '192.168.1.1', merk: 'Huawei', status: 'Online' },
      { id: 2, nama: 'OLT Bandung', ip: '192.168.1.2', merk: 'ZTE', status: 'Offline' },
      { id: 3, nama: 'OLT Surabaya', ip: '192.168.1.3', merk: 'Fiberhome', status: 'Online' },
      { id: 4, nama: 'OLT Medan', ip: '192.168.1.4', merk: 'Nokia', status: 'Online' },
      { id: 5, nama: 'OLT Bali', ip: '192.168.1.5', merk: 'Cisco', status: 'Offline' },
    ];
    
    res.render("olt-mgmn/index", {
      title: "List Olt Terhubung",
      olts,
      flashData
    });
  }
  static async tambahBaru(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    res.render("olt-mgmn/tambah-olt", {
      title: "Tambah Olt Baru",
      flashData
    });
  }
  
}

module.exports = OltController;