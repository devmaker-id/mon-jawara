const RadiusServer = require("../../models/radiusd/radServerModel");
const SSHConnectionChecker = require("../../helpers/sshCheck");

class RadiusServerController {

  static async index(req, res) {
    const flashData = req.session.flashData;
    delete req.session.flashData;

    try {
      const radiusServers = await RadiusServer.getAll();
      res.render("radius-server/index", {
        title: "Manajement radius server",
        radiusServers,
        flashData
      });
    } catch (err) {
      console.error(err);
      res.send("Gagal load data");
    }
  }

  static async store(req, res) {
    try {
      const {
        name,
        host,
        os,
        location,
        username,
        password,
        port_ssh,
        port_auth,
        port_acct
      } = req.body;

      /* ================= VALIDASI ================= */

      if (!name || !host) {
        return res.status(400).json({
          status: false,
          message: "Nama server dan host wajib diisi"
        });
      }

      const sshPort = Number(port_ssh) || 22;

      /* ================= CEK SSH ================= */

      const checker = new SSHConnectionChecker({
        host,
        port: sshPort,
        username,
        password
      });

      await checker.check(); // ✅ cukup tunggu, kalau gagal langsung throw

      /* ================= SIMPAN DB ================= */

      await RadiusServer.create({
        name,
        host,
        os: os || null,
        location: location || null,
        username: username || null,
        password: password || null,
        port_ssh: sshPort,
        port_auth: Number(port_auth) || 1812,
        port_acct: Number(port_acct) || 1813
      });

      return res.json({
        status: true,
        message: "Server RADIUS berhasil ditambahkan"
      });

    } catch (err) {
      console.error("STORE RADIUS ERROR:", err);

      return res.status(400).json({
        status: false,
        message: typeof err === "string" ? err : "Gagal menambahkan server"
      });
    }
  }

  static async update(req, res) {
    try {
      const {
        id,
        name,
        host,
        os,
        location,
        username,
        password,
        port_ssh,
        port_auth,
        port_acct
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID server tidak valid'
        });
      }

      /* ==========================
      * CEK KONEKSI SSH
      * ========================== */
      let sshConnected = false;

      if (host && username && port_ssh) {
        try {
          const checker = new SSHConnectionChecker({
            host,
            port: Number(port_ssh),
            username,
            password
          });

          await checker.check();
          sshConnected = true;

        } catch (sshErr) {
          return res.status(422).json({
            success: false,
            message: 'Gagal koneksi SSH. Periksa host, username, password, atau port.'
          });
        }
      }

      /* ==========================
      * DATA UPDATE
      * ========================== */
      const updateData = {
        name,
        host,
        os,
        location,
        username,
        port_ssh,
        port_auth,
        port_acct
      };

      // password hanya diupdate kalau diisi
      if (password) {
        updateData.password = password;
      }

      await RadiusServer.update(id, updateData);

      return res.json({
        success: true,
        sshConnected,
        message: 'Server berhasil diperbarui'
      });

    } catch (err) {
      console.error('UPDATE SERVER ERROR:', err);

      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
      });
    }
  }

  static async delete(req, res) {
    try {
      await RadiusServer.delete(req.body.id);
      req.flash("msg", { type: "success", text: "Server berhasil dihapus" });
      res.redirect("/radius");
    } catch (err) {
      console.error(err);
      req.flash("msg", { type: "danger", text: "Gagal hapus server" });
      res.redirect("/radius");
    }
  }
}

module.exports = RadiusServerController;