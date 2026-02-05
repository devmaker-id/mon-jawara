const RadiusServer = require("../../models/radiusd/radServerModel");
const checkSSH = require("../../helpers/sshCheck");

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

      // 🔴 VALIDASI WAJIB
      if (!name || !host) {
        return res.status(400).json({
          status: false,
          message: "Nama server dan host wajib diisi"
        });
      }

      const inspector = new checkSSH({
        host,
        port: port_ssh,
        username,
        password
      });

      const inspect = await inspector.inspect();

      // 🧠 SIMPAN
      // await RadiusServer.create({
      //   name,
      //   host,
      //   os,
      //   location,
      //   username,
      //   password,
      //   port_ssh: port_ssh || 22,
      //   port_auth: port_auth || 1812,
      //   port_acct: port_acct || 1813
      // });

      return res.json({
        status: true,
        data: req.body,
        ssh: inspect,
        message: "Server RADIUS berhasil ditambahkan"
      });

    } catch (err) {
      console.error(err);
      return res.status(400).json({
        status: false,
        message: err
      });
    }
  }

  static async update(req, res) {
    try {
      await RadiusServer.update(req.body.id, req.body);
      req.flash("msg", { type: "warning", text: "Server berhasil diperbarui" });
      res.redirect("/radius");
    } catch (err) {
      console.error(err);
      req.flash("msg", { type: "danger", text: "Gagal update server" });
      res.redirect("/radius");
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