/**
 * Format limitasi durasi/expired ke dalam bentuk string deskriptif.
 * @param {number|string} value - Angka durasi.
 * @param {string} unit - Satuan waktu: H, D, W, M.
 * @returns {string} - Contoh: "3 Hari", "2 Minggu", dst.
 */
function formatLimitasi(value, unit) {
  if (!value || !unit) return "unlimited";

  const mapUnit = {
    h: "Jam",
    d: "Hari",
    w: "Minggu",
    m: "Bulan"
  };

  const lowerUnit = unit.toLowerCase();
  const label = mapUnit[lowerUnit];

  if (!label) return "unlimited";

  return `${value} ${label}`;
}

/**
 * Parse kembali string seperti "3 Hari" menjadi { value: 3, unit: 'd' }
 * (opsional, jika kamu butuh konversi balik)
 */
function parseLimitasi(text) {
  if (!text || text.toLowerCase() === "unlimited") return { value: null, unit: null };

  const regex = /(\d+)\s*(Jam|Hari|Minggu|Bulan)/i;
  const match = text.match(regex);

  if (!match) return { value: null, unit: null };

  const value = parseInt(match[1]);
  const label = match[2].toLowerCase();

  const mapUnit = {
    jam: 'h',
    hari: 'd',
    minggu: 'w',
    bulan: 'm'
  };

  return {
    value,
    unit: mapUnit[label] || null
  };
}

module.exports = {
  formatLimitasi,
  parseLimitasi
};
