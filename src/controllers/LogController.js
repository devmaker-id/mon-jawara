const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const OltModel = require('../models/oltModel');
const TelegramModel = require("../models/telegramModel");
const Bot = require("../utils/telegramBot");

dayjs.extend(utc);
dayjs.extend(timezone);

// Parsing log menjadi pesan Telegram yang rapi
function parseLogEvent(logRaw) {
  const ipMatch = logRaw.match(/\b\d{1,3}(\.\d{1,3}){3}\b/);
  const ipOlt = ipMatch ? ipMatch[0] : '-';

  const namaOltMatch = logRaw.match(/(\bOLT_\w+):/);
  const namaOlt = namaOltMatch ? namaOltMatch[1] : '-';

  const portMatch = logRaw.match(/ONU\s+([\d\/:]+)/i);
  const portOnu = portMatch ? portMatch[1] : '-';

  const macMatch = logRaw.match(/\[\s*([0-9A-Fa-f:]{17})\s*\]/);
  const macOnu = macMatch ? macMatch[1] : '-';

  const deskripsiMatch = logRaw.match(/\[\s*([^\]]+)\s*\]\s*(linkdown|linkup)/i);
  const deskripsi = deskripsiMatch ? deskripsiMatch[1] : '-';

  const waktuMatch = logRaw.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+\-]\d{2}:\d{2}/);
  const waktu = waktuMatch ? dayjs(waktuMatch[0]).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss') : '-';

  let event = null;
  let icon = '';
  if (/linkdown/i.test(logRaw)) {
    event = 'LINKDOWN';
    icon = '🔴';
  } else if (/linkup/i.test(logRaw)) {
    event = 'LINKUP';
    icon = '🟢';
  } else {
    return null; // Event tidak relevan
  }

  const message = `*${event}* ${icon}

*OLT:* \`${namaOlt}\`
*IP OLT:* \`${ipOlt}\`
*Port ONU:* \`${portOnu}\`
*MAC ONU:* \`${macOnu}\`
*Deskripsi:* \`${deskripsi}\`
*Waktu:* ${waktu}

`;

  return { ipOlt, message };
}

class LogController {
  static async receiveLog(req, res) {
    const logRaw = req.body.log;

    try {
      const parsed = parseLogEvent(logRaw);
      if (!parsed) return res.status(200).json({ message: "Event tidak relevan, diabaikan." });

      const olt = await OltModel.getByHost(parsed.ipOlt);
      if (!olt) return res.status(200).json({ message: "IP OLT tidak terdaftar, diabaikan." });

      const tele = await TelegramModel.findByUserId(olt.user_id);
      if (!tele) return res.status(200).json({ message: "Telegram tidak ditemukan." });

      await Bot.sendMessage(tele.token_bot, tele.telegram_id, parsed.message);

      console.log("✔️ Pesan terkirim:", parsed.message);
      res.sendStatus(200);
    } catch (error) {
      console.error('❌ Error in LogController:', error);
      res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = LogController;
