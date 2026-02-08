// helpers/formatter.js
function rupiah(value) {
  const nominal = Number(value) || 0;
  return nominal.toLocaleString("id-ID", {
    //style: "currency",
    //currency: "IDR",
    minimumFractionDigits: 0
  });
}
function durationToSeconds(input) {
    if (!input || typeof input !== "string") {
        throw new Error("Invalid duration format");
    }

    const value = input.trim().toLowerCase();

    // match: "2 h", "3d", "1 w", "5m"
    const match = value.match(/^(\d+)\s*(h|d|w|m)$/);

    if (!match) {
        throw new Error(`Invalid duration value: ${input}`);
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers = {
        h: 3600,
        d: 86400,
        w: 604800,
        m: 2592000
    };

    return amount * multipliers[unit];
}

module.exports = { rupiah, durationToSeconds };
