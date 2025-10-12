class RadiusServerController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    
    const radiusServers = [
      {
        id: 1,
        name: "Radius-JKT-1",
        ip: "192.168.10.10",
        location: "Jakarta",
        os: "Ubuntu 22.04",
        status: "online",
        activeUsers: 135
      },
      {
        id: 2,
        name: "Radius-BDG-Main",
        ip: "192.168.20.10",
        location: "Bandung",
        os: "Debian 11",
        status: "offline",
        activeUsers: 0
      },
      {
        id: 3,
        name: "Radius-SBY-Edge",
        ip: "192.168.30.25",
        location: "Surabaya",
        os: "Ubuntu 20.04",
        status: "online",
        activeUsers: 89
      },
      {
        id: 4,
        name: "Radius-MKS-Test",
        ip: "192.168.40.15",
        location: "Makassar",
        os: "Debian 12",
        status: "offline",
        activeUsers: 0
      },
      {
        id: 5,
        name: "Radius-DPS",
        ip: "192.168.50.12",
        location: "Denpasar",
        os: "Ubuntu 22.04",
        status: "online",
        activeUsers: 42
      }
    ];


      
    res.render("radius-server/index", {
      title: "Manajemen Radius Server",
      radiusServers,
      flashData
    });
  }
  
}

module.exports = RadiusServerController;