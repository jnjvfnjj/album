import QRCode from 'qrcode';

export async function generateQrDataUrl(url: string, size = 400): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    throw err;
  }
}

/**
 * Downloads a high-resolution, print-ready branded QR sign image (PNG)
 */
export async function downloadBrandedQrSign(
  albumTitle: string,
  eventLocation: string | undefined,
  uploadUrl: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Print poster aspect ratio (1200 x 1600 px, high resolution)
  canvas.width = 1200;
  canvas.height = 1600;

  // Crisp white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer subtle hairline border
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Brand top kicker
  ctx.fillStyle = '#71717a';
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText('APERTURE LIVE · EVENT PHOTO GALLERY', canvas.width / 2, 120);

  // Album Title
  ctx.fillStyle = '#09090b';
  ctx.font = '700 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const displayTitle = albumTitle.length > 36 ? albumTitle.substring(0, 34) + '...' : albumTitle;
  ctx.fillText(displayTitle, canvas.width / 2, 210);

  // Venue / Subtitle
  if (eventLocation) {
    ctx.fillStyle = '#71717a';
    ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(eventLocation, canvas.width / 2, 260);
  }

  // Generate large QR Code
  const qrDataUrl = await generateQrDataUrl(uploadUrl, 680);
  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = qrDataUrl;
  });

  // QR Container background
  const qrX = (canvas.width - 720) / 2;
  const qrY = 320;
  ctx.fillStyle = '#f4f4f5';
  ctx.fillRect(qrX, qrY, 720, 720);
  ctx.strokeStyle = '#d4d4d8';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX, qrY, 720, 720);

  // Draw QR Image
  ctx.drawImage(img, qrX + 20, qrY + 20, 680, 680);

  // Instructions Header
  ctx.fillStyle = '#09090b';
  ctx.font = '700 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Share Your Event Moments', canvas.width / 2, 1110);

  // 3-Step Clear Instructions
  const steps = [
    '1. Open your phone camera & scan the QR code',
    '2. Select your favorite event photos',
    '3. Upload instantly — no app or signup required',
  ];

  ctx.fillStyle = '#3f3f46';
  ctx.font = '500 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  steps.forEach((step, idx) => {
    ctx.fillText(step, canvas.width / 2, 1180 + idx * 48);
  });

  // URL fallback at bottom
  ctx.fillStyle = '#71717a';
  ctx.font = '400 22px monospace';
  ctx.fillText(uploadUrl, canvas.width / 2, 1420);

  // Bottom watermark / confidence
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Powered by Aperture Live · High-Speed Collaborative Galleries', canvas.width / 2, 1500);

  // Trigger download
  const downloadUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${albumTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_QR_Signage.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
