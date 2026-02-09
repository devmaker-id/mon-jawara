const generateVouchers = require("../utils/generateVouchers");

/**
 * Helper untuk membuat data voucher siap simpan ke DB
 * @param {Object} params - Parameter input
 * @returns {Array} - Array objek voucher siap insert
 */
function prepareVoucherData({
  total,
  codeLength,
  passLength,
  kombinasi,
  type,
  owner_id,
  owner_username,
  profilegroup,
  harga_beli,
  price,
  durasi,
  prefix = "",
  serviceType = "HOTSPOT"
}) {
  const upperType = type.toUpperCase();

  // Generate kode voucher
  const generated = generateVouchers({
    total,
    codeLength,
    passLength,
    type: kombinasi,
    prefix,
    userType: upperType,
    serviceType,
  });

  const timestamp = new Date();

  const vouchers = generated.map(({ code, secret }) => ({
    code,
    secret: upperType === "VOUCHER" ? code : secret, // VOUCHER => password = code
    type: upperType,
    owner_id,
    owner_username,
    service_type: serviceType,
    profilegroup,
    harga_beli,
    price,
    durasi,
    created_at: timestamp,
    updated_at: timestamp,
  }));

  return vouchers;
}

module.exports = {
  prepareVoucherData
};
