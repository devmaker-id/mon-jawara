function generateCharset(type) {
  const lowercase = "abcdefghjkmnpqrtuvwxy";       // tanpa i, l, o, s
  const uppercase = "ABCDEFGHJKMNPQRTUVWXY";       // tanpa I, L, O, S
  const numbers   = "2346789";                     // tanpa 0, 1, 5

  switch (type) {
    case 1: return lowercase;
    case 2: return uppercase;
    case 3: return lowercase + numbers;
    case 4: return uppercase + numbers;
    case 5: return lowercase + uppercase + numbers;
    case 6: return numbers;
    default: throw new Error("Tipe kombinasi tidak valid (1-6)");
  }
}

function generateRandomString(length, charset) {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return str;
}

function generateVouchers({ 
  total = 10, 
  codeLength = 6, 
  passLength = 4,
  type = 5, 
  prefix = "", 
  userType = "VOUCHER",
  serviceType = "HOTSPOT"
}) {
  if (codeLength < 4 || codeLength > 10 || passLength < 4 || passLength > 10) {
    throw new Error("Panjang kode dan password harus antara 4 hingga 10 digit.");
  }

  if (total < 1) throw new Error("Jumlah voucher minimal 1.");

  const charset = generateCharset(type);
  const generatedCodes = new Set();
  const maxAttempts = total * 10;
  let attempts = 0;

  const now = new Date();
  const result = [];

  while (generatedCodes.size < total && attempts < maxAttempts) {
    const code = prefix + generateRandomString(codeLength, charset);

    if (!generatedCodes.has(code)) {
      generatedCodes.add(code);

      const secret = generateRandomString(passLength, charset);

      result.push({
        code,
        secret,
        type: userType,
        service_type: serviceType,
        created_at: now,
        updated_at: now
      });
    }

    attempts++;
  }

  if (generatedCodes.size < total) {
    throw new Error("Gagal menghasilkan semua voucher unik. Coba kurangi jumlah atau panjang kode.");
  }

  return result;
}

module.exports = generateVouchers;
