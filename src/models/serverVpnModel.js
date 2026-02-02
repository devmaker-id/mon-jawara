const db = require("../config/db");
const RouterOSAPI = require("node-routeros").RouterOSAPI;
const { ipToLong, longToIp } = require("../helpers/ipHelper");

class ServerVpn {
  
  static async getById(id) {
    try {
      const sql = `
        SELECT 
          s.id AS server_id,
          s.name AS server_name,
          s.host AS server_host,
          vt.id AS vpn_type_id,
          vt.name AS vpn_type_name,
          svt.port
        FROM 
          tbl_server_vpn_types svt
        JOIN 
          tbl_vpn_server s ON svt.server_id = s.id
        JOIN 
          tbl_vpn_types vt ON svt.vpn_type_id = vt.id
        WHERE 
          s.id = ?
      `;
      const [results] = await db.query(sql, [id]);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getVpnType(id) {
    try {
      const sql = `
        SELECT 
          vt.id AS vpn_type_id,
          vt.name AS vpn_type_name,
          svt.port
        FROM 
          tbl_server_vpn_types svt
        JOIN 
          tbl_vpn_types vt ON svt.vpn_type_id = vt.id
        WHERE 
          svt.server_id = ?
      `;
      const [results] = await db.query(sql, [id]);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getAll() {
    try {
      const sql = "SELECT * FROM tbl_vpn_server";
      const [results] = await db.query(sql);
      return results;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async detailVpnServer(id) {
    try {
      const sql = `
        SELECT 
          s.id AS server_id,
          s.name AS server_name,
          s.host AS server_host,
          vt.id AS vpn_type_id,
          vt.name AS vpn_type_name,
          svt.port
        FROM 
          tbl_server_vpn_types svt
        JOIN 
          tbl_vpn_server s ON svt.server_id = s.id
        JOIN 
          tbl_vpn_types vt ON svt.vpn_type_id = vt.id
        WHERE 
          s.id = ?
      `;
      const [results] = await db.query(sql, [id]);
      return results[0];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getServerVpnDetail(serverId, vpnTypeId) {
    try {
      const sql = `
        SELECT 
          s.id AS server_id,
          s.name AS server_name,
          s.host AS server_host,
          vt.id AS vpn_type_id,
          vt.name AS vpn_type_name,
          svt.port
        FROM 
          tbl_server_vpn_types svt
        JOIN 
          tbl_vpn_server s ON svt.server_id = s.id
        JOIN 
          tbl_vpn_types vt ON svt.vpn_type_id = vt.id
        WHERE 
          s.id = ? AND vt.id = ?
      `;
      const [results] = await db.query(sql, [serverId, vpnTypeId]);
      return results[0];
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
  static async getVpnServerByHost(host) {
    try {
      const sql = `SELECT * FROM tbl_vpn_server WHERE host = ?`;
      const [results] = await db.query(sql,[host]);
      return results[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async createIp(interfaceName) {
    try {
      // Ambil pool IP berdasarkan interface
      const sql = `SELECT * FROM tbl_ip_location WHERE interfaces = ? AND status = 'active' LIMIT 1`;
      const [rows] = await db.query(sql, [interfaceName]);

      if (rows.length === 0) throw new Error("No active IP pool found for this interface");
      const pool = rows[0];

      const startIp = pool.start_ip;
      const endIp = pool.end_ip;

      // Ambil semua IP yang sudah digunakan dalam range pool
      const [usedRows] = await db.query(
        `SELECT ip_vpn FROM tbl_akun_vpn WHERE ip_vpn BETWEEN ? AND ?`,
        [startIp, endIp]
      );
      const usedIps = new Set(usedRows.map(row => row.ip_vpn));

      // Loop dari start_ip ke end_ip, cari IP yang belum dipakai
      let currentIp = startIp;
      while (ipToLong(currentIp) <= ipToLong(endIp)) {
        if (!usedIps.has(currentIp)) {
          const ipUsed = {
            address: pool.address,
            pool: currentIp
          }
          return ipUsed; // IP siap pakai
        }
        currentIp = longToIp(ipToLong(currentIp) + 1);
      }

      throw new Error("No available IP in the pool");

    } catch (error) {
      console.error("createIp error:", error.message);
      throw error;
    }
  }
  
  static async createVpnToChr(params) {
    // Ambil data server CHR dari database
    const sql = `SELECT * FROM tbl_vpn_server WHERE host = ?`;
    const [result] = await db.query(sql, [params.host]);

    if (result.length === 0) throw new Error('Server not found');

    const chr = result[0];
    //console.log(chr);
    
    const conn = new RouterOSAPI({
      host: chr.host,
      user: chr.username,
      password: chr.password,
      port: chr.port_api,
      keepalive: true
    });

    try {
      await conn.connect();
      const respon = await conn.write('/ppp/secret/add', [
        `=name=${params.username}`,
        `=password=${params.password}`,
        `=service=${params.type || 'any'}`,
        `=profile=Radius-VPN`,
        `=local-address=${params.gateway}`,
        `=remote-address=${params.ip_vpn}`
      ]);
      
      // Add NAT rules for each service with default to-port and a comment
      const natRules = [
        { service: 'winbox', port: params.port_winbox, defaultPort: 8291 },
        { service: 'webfig', port: params.port_webfig, defaultPort: 80 },
        { service: 'ssh', port: params.port_ssh, defaultPort: 22 },
        { service: 'api', port: params.port_api, defaultPort: 8728 }
      ];
      
      // Create NAT rules for each service
      for (let rule of natRules) {
        const { service, port, defaultPort } = rule;
  
        // Add NAT rule for forwarding the port to internal VPN IP
        await conn.write('/ip/firewall/nat/add', [
          `=chain=dstnat`,
          `=dst-address=${params.host}`,
          `=protocol=tcp`,
          `=dst-port=${port}`,
          `=action=dst-nat`,
          `=to-addresses=${params.ip_vpn}`,
          `=to-ports=${defaultPort}`, // Let MikroTik handle the default to-port
          `=comment=${params.username}_${service}` // Add a comment for easy identification
        ]);
  
        //console.log(`Added NAT rule for ${service} on port ${port}`);
      }

      await conn.close();

      return {
        success: true,
        ret: respon[0].ret
      };

    } catch (error) {
      console.error('VPN creation failed:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  static async deleteVpnChr(vpnId) {
    const retVpn = `SELECT ret,server_host,username FROM tbl_akun_vpn WHERE id = ?`;
    const [vpn] = await db.query(retVpn, [vpnId]);
    
    if (vpn.length === 0) throw new Error('Vpn not found');
    const akun = vpn[0];
    
    const sql = `SELECT * FROM tbl_vpn_server WHERE host = ?`;
    const [result] = await db.query(sql, [
      akun.server_host
    ]);

    if (result.length === 0) throw new Error('Server not found');
    
    const chr = result[0];
    const conn = new RouterOSAPI({
      host: chr.host,
      user: chr.username,
      password: chr.password,
      port: chr.port_api,
      keepalive: true
    });
    try {
      await conn.connect();
      const respon = await conn.write('/ppp/secret/remove', [
        `=.id=${akun.ret}`
      ]);
      
      // --- Hapus NAT Rules ---
      const services = ['ssh', 'winbox', 'webfig', 'api'];
      const comments = services.map(service => `${akun.username}_${service}`);
  
      // Tarik semua NAT rules sekali aja
      const allNatRules = await conn.write('/ip/firewall/nat/print', [
        `=.proplist=.id,comment`
      ]);
  
      for (const rule of allNatRules) {
        if (comments.includes(rule.comment)) {
          await conn.write('/ip/firewall/nat/remove', [
            `=.id=${rule[".id"]}`
          ]);
        }
      }
      
      await conn.close();
      return {
        success: true
      };
    } catch (error) {
      console.error(error.message);
      return { success: false, error: error.message };
    }
  }
  
  static async changeApiPort(server_host, comment, apiPort) {
    try {
      const sql = `SELECT * FROM tbl_vpn_server WHERE host = ?`;
      const [result] = await db.query(sql, [
        server_host
      ]);
      const chr = result[0];
      const conn = new RouterOSAPI({
        host: chr.host,
        user: chr.username,
        password: chr.password,
        port: chr.port_api,
        keepalive: true
      });
      await conn.connect();
      const natRules = await conn.write('/ip/firewall/nat/print', [
        `?comment=${comment}`,
        `=.proplist=.id`
      ]);
      
      if( !natRules ) {
        await conn.close();
        return {
          success: false,
          msg: "commemt ga valid"
        }
      }
      
      const ruleId = natRules[0][".id"];
      await conn.write('/ip/firewall/nat/set', [
        `=.id=${ruleId}`,
        `=to-ports=${apiPort}`
      ]);
      await conn.close();
      return {
        success: true
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async getIdentityMikrotik(host, username, password, port) {
    try {
      const conn = new RouterOSAPI({
        host: host,
        user: username,
        password: password,
        port: port,
        keepalive: true
      });
      
      await conn.connect();
      const identity = await conn.write('/system/identity/print');
      await conn.close();
      return identity;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async deleteMikrotikUsedVpn(mikrotikid, userid, vpnid) {
    try {
      const sql = `
        DELETE FROM tbl_mikrotik 
        WHERE id = ? AND user_id = ? AND vpn_id = ?
      `;
      const values = [mikrotikid, userid, vpnid];
      const [result] = await db.query(sql, values);
      return result.affectedRows > 0; // true kalau ada data yang kehapus
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  
}

module.exports = ServerVpn;