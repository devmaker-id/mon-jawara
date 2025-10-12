const { Client } = require('ssh2');
const MikhmonModel = require("../models/mikhmonModel");
const VpsModel = require("../models/vpsModel");

class MikhmonController {
  
  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;
    const user = req.session.user;
    
    const rootdomaindata = await VpsModel.allData();
    const mikhmon = await MikhmonModel.getAllUserId(user.id);
    
    res.render("mikhmon/index", {
      title: "Mikhmon Dashboard",
      flashData,
      rootdomaindata,
      mikhmon
    });
  }
  
  static async checkDomain(req, res) {
    try {
      const { domain } = req.body;
      const rows = await MikhmonModel.checkDomain(domain);
      if (!rows.length > 0) {
        return res.json({ available: true });
      } else {
        return res.json({ available: false });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ available: false });
    }
  }

  static async createDomain(req, res) {
    try {
      const {
        domain,
        rootDomain,
        rosVersion
      } = req.body;
      if (!domain || !rootDomain || !rosVersion) {
        return res.status(404).json({
          success: false,
          icon: "info",
          msg: "Form tidak lengkap...",
        });
      }
      
      if( !["6", "7"].includes(rosVersion) ) {
        return res.status(403).json({
          success: false,
          icon: "error",
          msg: "Ros bukan 6/7...",
        });
      }
      
      const user = req.session.user;
      const fullDomain = `${domain}.${rootDomain}`;
      
      const params = {
        user_id: user.id,
        ros_version: rosVersion,
        domain: domain,
        root_domain: rootDomain,
        full_domain: fullDomain
      }
      
      // 1. Cek apakah subdomain sudah ada di DB
      const existingDomain = await MikhmonModel.findByFullDomain(fullDomain);
      if (existingDomain) {
        return res.status(400).json({
          success: false,
          icon: "error",
          msg: `Subdomain ${fullDomain} sudah digunakan.`,
        });
      }
      
      const row = await MikhmonModel.createData(params);
      if( !row.affectedRows ) {
        return res.status(404).json({
          success: false,
          icon: "error",
          msg: "Gagal nambah domain...",
        });
      }
      
      const rowVps = await VpsModel.getRootDomain(rootDomain);
     
      const conn = new Client();
      
      // Perintah yang akan dikirim ke server
      const command = `./create_subdomain.sh ${domain} ${rosVersion}`;

      conn.on('ready', () => {
        console.log('SSH Connection Successful!');
        
        conn.exec(command, (err, stream) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              success: false,
              icon: "error",
              msg: "Gagal menjalankan command."
            });
          }
  
          let output = '';
      
          stream.on('close', (code, signal) => {
            console.log(`Command finished with code ${code}, signal ${signal}`);
            conn.end(); // Tutup koneksi setelah selesai
            if (output.includes('DONE')) {
              return res.status(200).json({
                success: true,
                icon: "success",
                msg: "Domain berhasil dibuat.",
              });
            } else {
              return res.status(500).json({
                success: false,
                icon: "error",
                msg: "Command belum selesai atau gagal.",
              });
            }
          }).on('data', (data) => {
            output += data.toString();
            console.log('STDOUT:', data.toString());
          }).stderr.on('data', (data) => {
            console.error('STDERR:', data.toString());
          });
        });
        
      }).on('error', (err) => {
        console.error('SSH Connection Error:', err);
      }).connect({
        host: rowVps.host,
        port: rowVps.port_ssh,
        username: rowVps.username,
        password: rowVps.password
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        icon: "error",
        msg: "Terjadi kesalahan di server"
      });
    }
  }
  
  static async deleteDomain(req, res) {
    try {
      const {
        id, fulldomain
      } = req.body;
      const user = req.session.user;
      
      if (!id || !fulldomain){
        return res.json({
          status: false,
          title: "Kesalahan",
          msg: "Kesalahan validasi data",
          icon: "error"
        });
      }
      
      const rowDelete = await MikhmonModel.deleteByid(id, user.id);
      if(!rowDelete.affectedRows){
        return res.json({
          status: false,
          title: "Gagal",
          msg: `Gagal hapus DB!!!`,
          icon: "error"
        });
      }
      // Ambil domain sebelum titik
      const domainName = fulldomain.split('.')[0];
      // Ambil VPS
      const rowVps = await VpsModel.getRootDomain(fulldomain.split('.').slice(1).join('.'));
      const conn = new Client();
      const command = `./delete_subdomain.sh ${domainName}`;
      conn.on('ready', () => {
        console.log('SSH Connection Successful!');
  
        conn.exec(command, (err, stream) => {
          if (err) {
            console.error(err);
            return res.status(500).json({
              success: false,
              icon: "error",
              msg: "Gagal menjalankan command."
            });
          }
          
          let output = '';
  
          stream.on('close', (code, signal) => {
            console.log(`Command finished with code ${code}, signal ${signal}`);
            conn.end(); // Tutup koneksi
            if (output.includes('DONE')) {
              return res.status(200).json({
                success: true,
                icon: "success",
                msg: "Domain berhasil dihapus.",
              });
            } else {
              return res.status(500).json({
                success: false,
                icon: "error",
                msg: "Command belum selesai atau gagal.",
              });
            }
          }).on('data', (data) => {
            console.log('STDOUT:', data.toString());
            output += data.toString();
          }).stderr.on('data', (data) => {
            console.error('STDERR:', data.toString());
          });
        });
      }).on('error', (err) => {
        console.error('SSH Connection Error:', err);
      }).connect({
        host: rowVps.host,
        port: rowVps.port_ssh,
        username: rowVps.username,
        password: rowVps.password
      });
    } catch (error) {
      return res.json({
        status: false,
        title: "Gagal",
        msg: `Server Bermasalah`,
        icon: "error"
      });
    }
    
  }
  
}
module.exports = MikhmonController;