// helpers/radius.helper.js
const { byComment, id } = require('./rosFilter');

async function removeRadiusByComment(conn, comment) {
  const list = await conn.write('/radius/print', [
    '=.proplist=.id,comment'
  ]);

  const targets = list.filter(byComment(comment));

  for (const r of targets) {
    await conn.write('/radius/remove', [
      `=.id=${id(r)}`
    ]);
  }
}

async function addRadius(conn, config) {
  const {
    address,
    secret,
    service = 'ppp,hotspot',
    authPort,
    acctPort,
    timeout = '2s',
    comment
  } = config;

  await conn.write('/radius/add', [
    `=address=${address}`,
    `=secret=${secret}`,
    `=service=${service}`,
    `=authentication-port=${authPort}`,
    `=accounting-port=${acctPort}`,
    `=timeout=${timeout}`,
    comment ? `=comment=${comment}` : null
  ].filter(Boolean));
}

async function enableIncomingRadius(conn) {
  await conn.write('/radius/incoming/set', [
    '=accept=yes'
  ]);
}

module.exports = {
  removeRadiusByComment,
  addRadius,
  enableIncomingRadius
};