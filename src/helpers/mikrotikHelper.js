// // helpers/mikrotikHelper.js
// const RouterOS = require('node-routeros');

// async function connectToRouter() {
//   try {
//     await router.connect();
//     console.log('Connected to Mikrotik');
//   } catch (error) {
//     console.error('Error connecting to Mikrotik:', error);
//   }
// }

// async function addVpnInterface(vpnType, vpnHost, username, password) {
//   const ifaceName = `${vpnType}-VPN`;
//   const command = `/interface ${vpnType}-client add disabled=no connect-to="${vpnHost}" name="${ifaceName}" user="${username}" password="${password}" comment="VPN Interface"`;
  
//   try {
//     await router.command(command);
//     console.log('VPN Interface added');
//   } catch (error) {
//     console.error('Error adding VPN Interface:', error);
//   }
// }

// module.exports = {
//   connectToRouter,
//   addVpnInterface,
// };

// helpers/mikrotikHelper.js
const { RouterOSAPI } = require('node-routeros');

/**
 * Create RouterOS connection
 */
function createConnection(config) {
  return new RouterOSAPI({
    host: config.host,
    user: config.username,
    password: config.password,
    port: config.port_api,
    timeout: config.timeout || 3
  });
}

/**
 * Execute RouterOS command safely with timeout
 */
async function execute(config, callback, timeoutSec = 4) {
  const conn = createConnection(config);

  try {
    await Promise.race([
      conn.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), timeoutSec * 1000)
      )
    ]);

    const result = await callback(conn);
    return { success: true, data: result };

  } catch (err) {
    return {
      success: false,
      message: err.message.includes('timeout')
        ? 'Timeout: Mikrotik tidak dapat dijangkau'
        : err.message
    };
  } finally {
    conn.close?.();
  }
}

/**
 * Test connection
 */
async function testConnection(config) {
  return execute(config, async (conn) => {
    const res = await conn.write('/system/identity/print');
    return { identity: res[0]?.name };
  });
}

/**
 * Add VPN Interface
 */
async function addVpnInterface(config, vpnType, vpnHost, user, pass) {
  return execute(config, async (conn) => {
    const ifaceName = `${vpnType}-VPN`;

    return conn.write(`/interface/${vpnType}-client/add`, [
      `=name=${ifaceName}`,
      `=connect-to=${vpnHost}`,
      `=user=${user}`,
      `=password=${pass}`,
      `=disabled=no`,
      `=comment=VPN Interface`
    ]);
  });
}

module.exports = {
  testConnection,
  addVpnInterface
};
