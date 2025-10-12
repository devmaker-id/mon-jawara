function formatRateLimit(bw, useBurst = false) {
  const convert = (val, unit) => {
    if (!val) return null;
    return unit.toLowerCase() === 'mbps' ? `${val}M` : `${val}k`;
  };

  const calcThreshold = (val) => {
    const half = Math.floor(val / 2);
    return half <= 0 ? 1 : half;
  };

  const rateDown = convert(bw.min_download, bw.unit_min_download);
  const rateUp = convert(bw.min_upload, bw.unit_min_upload);

  if (!useBurst || !bw.max_download || !bw.max_upload) {
    return `${rateDown}/${rateUp}`;
  }

  const burstDown = convert(bw.max_download, bw.unit_max_download);
  const burstUp = convert(bw.max_upload, bw.unit_max_upload);

  const thresholdDown = convert(
    calcThreshold(bw.min_download),
    bw.unit_min_download
  );
  const thresholdUp = convert(
    calcThreshold(bw.min_upload),
    bw.unit_min_upload
  );

  const burstTime = 40;
  const priority = 8;

  return `${rateDown}/${rateUp} ${burstDown}/${burstUp} ${thresholdDown}/${thresholdUp} ${burstTime}/${burstTime} ${priority}`;
}

module.exports = formatRateLimit;
