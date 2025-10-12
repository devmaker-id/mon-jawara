// helpers/mikrotikHelper.js
const RouterOS = require('node-routeros');

async function connectToRouter() {
  try {
    await router.connect();
    console.log('Connected to Mikrotik');
  } catch (error) {
    console.error('Error connecting to Mikrotik:', error);
  }
}

async function addVpnInterface(vpnType, vpnHost, username, password) {
  const ifaceName = `${vpnType}-VPN`;
  const command = `/interface ${vpnType}-client add disabled=no connect-to="${vpnHost}" name="${ifaceName}" user="${username}" password="${password}" comment="VPN Interface"`;
  
  try {
    await router.command(command);
    console.log('VPN Interface added');
  } catch (error) {
    console.error('Error adding VPN Interface:', error);
  }
}

module.exports = {
  connectToRouter,
  addVpnInterface,
};
