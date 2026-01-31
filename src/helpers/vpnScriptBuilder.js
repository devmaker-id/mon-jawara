function buildVpnScript({
  vpnType,
  rosVersion,
  vpnHost,
  vpnPort,
  username,
  password,
  ipaddr,
  mikrotikUser = "vpnuser",
  mikrotikUserPass = "vpn12345",
}) {
  const ifaceName = "JAWARA-VPN";

  const removeOld = [
    `/interface ovpn-client remove [find name="${ifaceName}"]`,
    `/interface sstp-client remove [find name="${ifaceName}"]`,
    `/interface l2tp-client remove [find name="${ifaceName}"]`,
    `/interface pptp-client remove [find name="${ifaceName}"]`,
    rosVersion === "7"
      ? `/routing table remove [find name="${ifaceName}"]`
      : null,
    `/ip route remove [find comment="static route jawara-vpn"]`,
    rosVersion === "7"
      ? `/routing rule remove [find comment="static route jawara-vpn"]`
      : `/ip route rule remove [find comment="static route jawara-vpn"]`,
      `/system scheduler remove [find name="vpn-watchdog"]`,
  ]
    .filter(Boolean)
    .join(";");

  const portPart =
    vpnType === "ovpn" && vpnPort ? `port=${vpnPort} ` : "";

  const addInterface = `/interface ${vpnType}-client add disabled=no connect-to="${vpnHost}" ${portPart}name="${ifaceName}" user="${username}" password="${password}" comment="IPADDR : ${ipaddr}"`;

  const routing = rosVersion === "7"
    ? [
        `/routing table add name="${ifaceName}" fib`,
        `/routing rule add dst-address="168.68.0.25" action=lookup-only-in-table table="${ifaceName}" comment="static route jawara-vpn"`,
        `/ip route add disabled=no gateway="${ifaceName}" dst-address="168.68.0.25" routing-table="${ifaceName}" comment="static route jawara-vpn"`,
      ]
    : [
        `/ip route add disabled=no gateway="${ifaceName}" dst-address="168.68.0.25" routing-mark="${ifaceName}" comment="static route jawara-vpn"`,
        `/ip route rule add action=lookup-only-in-table dst-address="168.68.0.25" table="${ifaceName}" comment="static route jawara-vpn"`,
      ];

  const userGroup = [
    `/user remove [find comment="jawara.monitoring"]`,
    `/user group remove [find comment="jawara.monitoring"]`,
    `/user group add name="vpn.group" policy=read,write,api,test,policy,sensitive comment="jawara.monitoring"`,
    `/user add name="${mikrotikUser}" group="vpn.group" password=${mikrotikUserPass} comment="jawara.monitoring"`,
  ];
  
  const watchdogScript = `
    :local iface "${ifaceName}"
    :local targetIp "168.68.0.25"
    :local success 0
    :for i from=1 to=5 do={
      :if ([/ping \$targetIp interface=\$iface count=1] > 0) do={
        :set success (\$success + 1)
      }
      :delay 1
    }
    :if (\$success < 3) do={
      /interface set \$iface disabled=yes
      :delay 3
      /interface set \$iface disabled=no
      :log warning "VPN Interface \$iface di-reset karena hanya \$success/5 ping sukses ke \$targetIp"
    } else={
      :log info "VPN Interface \$iface sehat: \$success/5 ping sukses ke \$targetIp"
    }
  `.trim();
  
  const escapedWatchdogScript = watchdogScript
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/\s+/g, " ");

  const scheduler = `/system scheduler add name="vpn-watchdog" interval=1m on-event="${escapedWatchdogScript}" comment="Auto restart VPN jika gagal ping"`;

  // const fetchScript = [
  //   `/tool fetch url="https://my.topsetting.com:2083/cache/AutoSwitchVPN.rsc"`,
  //   `/import file="AutoSwitchVPN.rsc"`,
  //   `/file remove [find name="AutoSwitchVPN.rsc"]`,
  // ];

  //return [removeOld, addInterface, ...routing, ...userGroup, ...fetchScript].join(";");
  
  return [removeOld, addInterface, ...routing, ...userGroup, scheduler].join(";");
}

function buildVpnCleanupScript({ rosVersion }) {
  const ifaceName = "JAWARA-VPN";

  const cleanup = [
    `/interface ovpn-client remove [find name="${ifaceName}"]`,
    `/interface sstp-client remove [find name="${ifaceName}"]`,
    `/interface l2tp-client remove [find name="${ifaceName}"]`,
    `/interface pptp-client remove [find name="${ifaceName}"]`,
    rosVersion === "7"
      ? `/routing table remove [find name="${ifaceName}"]`
      : null,
    `/ip route remove [find comment="static route jawara-vpn"]`,
    rosVersion === "7"
      ? `/routing rule remove [find comment="static route jawara-vpn"]`
      : `/ip route rule remove [find comment="static route jawara-vpn"]`,
    `/system scheduler remove [find name="vpn-watchdog"]`,
    `/user remove [find comment="jawara.monitoring"]`,
    `/user group remove [find comment="jawara.monitoring"]`,
  ]
  .filter(Boolean)
    .join(";");

  return cleanup;
}

module.exports = {
  buildVpnScript,
  buildVpnCleanupScript,
};
