const { id } = require('./rosFilter');

async function enableHotspotRadius(conn, interim = '5m') {
  const profiles = await conn.write(
    '/ip/hotspot/profile/print',
    ['=.proplist=.id']
  );

  for (const p of profiles) {
    await conn.write('/ip/hotspot/profile/set', [
      `=.id=${id(p)}`,
      '=use-radius=yes',
      `=radius-interim-update=${interim}`
    ]);
  }
}

async function enablePPPRadius(conn, interim = '5m') {
  await conn.write('/ppp/aaa/set', [
    '=use-radius=yes',
    '=accounting=yes',
    `=interim-update=${interim}`
  ]);
}

module.exports = {
  enableHotspotRadius,
  enablePPPRadius
};