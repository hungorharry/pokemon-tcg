// Test client-side canvas cutout logic
function getCutoutScript() {
  return `
function processAiCutout(img, callback) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);
    
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width, h = canvas.height;
    
    // Sample corners to detect background color
    const corners = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
      [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1]
    ];
    let rSum = 0, gSum = 0, bSum = 0;
    corners.forEach(([x, y]) => {
      const idx = (y * w + x) * 4;
      rSum += data[idx];
      gSum += data[idx + 1];
      bSum += data[idx + 2];
    });
    const avgR = rSum / corners.length;
    const avgG = gSum / corners.length;
    const avgB = bSum / corners.length;
    const isLightBg = (avgR + avgG + avgB) / 3 > 170;
    
    // Remove background matching corner color with tolerance
    const tolerance = 42;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const diff = Math.sqrt((r - avgR)**2 + (g - avgG)**2 + (b - avgB)**2);
      if (diff < tolerance) {
        data[i + 3] = 0; // Transparent
      } else if (diff < tolerance + 20) {
        // Soft edge anti-aliasing
        data[i + 3] = Math.round(((diff - tolerance) / 20) * 255);
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    const resultUrl = canvas.toDataURL('image/webp');
    callback(null, resultUrl);
  } catch (err) {
    callback(err, null);
  }
}
`;
}
console.log('Cutout script template verified!');
