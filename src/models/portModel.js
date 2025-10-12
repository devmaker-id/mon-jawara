const db = require("../config/db");
const PortAllocator = require('../helpers/portAllocator');

class PortModel {

  static async getAllPorts() {
    try {
      const sql = `SELECT * FROM tbl_port_services WHERE is_enabled = 1`;
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  static async getUsedPortsByService(serviceName) {
    try {
      const sql = `SELECT public_port_${serviceName} AS port FROM tbl_akun_vpn WHERE public_port_${serviceName} IS NOT NULL`;
      const [results] = await db.query(sql);
      return results.map(row => row.port);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  static async updateLastUsedPort(serviceId, port) {
    try {
      const sql = `UPDATE tbl_port_services SET last_used_port = ? WHERE id = ?`;
      await db.query(sql, [port, serviceId]);
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Fungsi untuk alokasikan port untuk semua service yang aktif
   */
  static async creatPortAllServices() {
    try {
      // 1. Ambil semua service aktif
      const services = await this.getAllPorts();
      
      // 2. Ambil daftar port yang sudah terpakai
      const usedPortsMap = {};
      for (const svc of services) {
        usedPortsMap[svc.service_name] = await this.getUsedPortsByService(svc.service_name);
      }

      // 3. Alokasikan port dengan PortAllocator
      const allocator = new PortAllocator(services)
        .setUsedPortsMap(usedPortsMap)
        .allocate();
      
      const allocations = allocator.get();
      
      // 4. Update last_used_port di tbl_port_services
      for (const [name, data] of Object.entries(allocations)) {
        await this.updateLastUsedPort(data.service_id, data.port);
      }

      // Return allocations untuk verifikasi
      return allocations;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
}

module.exports = PortModel;
