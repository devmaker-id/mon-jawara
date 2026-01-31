// helpers/formatter.js
function rupiah(value) {
  const nominal = Number(value) || 0;
  return nominal.toLocaleString("id-ID", {
    //style: "currency",
    //currency: "IDR",
    minimumFractionDigits: 0
  });
}

module.exports = { rupiah };
