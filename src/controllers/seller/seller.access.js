const AccessSeller = require("../../models/seller/access.model");
const OnuModel = require("../../models/seller/onu.model");

class SellerController {

    static async index(req, res) {
        try {
            const flashData = req.session.flashData;
            delete req.session.flashData;

            const allAccess = await AccessSeller.getAll();

            res.render("seller/aksess_khusus", {
                title: "Manajemen Seller Access",
                allAccess,
                flashData
            });

        } catch (error) {
            console.error(error);
                res.status(500).render("errors/500", {
                message: "Gagal memuat data seller access"
            });
        }
    }

    static async getAvailableSellers(req, res) {
        try {
            const sellers = await AccessSeller.getAvailableSellers();
            res.json({ success: true, data: sellers });
        } catch (err) {
            res.status(500).json({ success: false });
        }
    }

    static async onuAvailabel(req, res) {

        try {
            const sellers = await OnuModel.getAll();
            res.json({ success: true, data: sellers });
        } catch (err) {
            res.status(500).json({ success: false });
        }
    }

    static async create(req, res) {
        const data = req.body;
        console.log(data);
    }



}

module.exports = SellerController;