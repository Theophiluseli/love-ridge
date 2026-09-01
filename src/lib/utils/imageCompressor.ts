import { LOVERIDGE_LOGO_WHITE_BASE64 } from './logoBase64';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Loads the Loveridge logo image from the bundled Base64 string or public path.
 */
function loadLogoImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => resolve(img);
      fallback.src = '/logo-white.png';
    };
    img.src = LOVERIDGE_LOGO_WHITE_BASE64;
  });
}

/**
 * Draws the official Loveridge signature watermark directly onto an HTML5 Canvas.
 * Adds both a subtle, anti-theft center watermark and a crisp bottom-right brand badge.
 */
export async function applyLoveridgeWatermark(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<void> {
  const { width, height } = canvas;
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadLogoImage();
  } catch (e) {
    console.warn('Watermark logo load error:', e);
  }

  // 1. Subtle, elegant center watermark overlay (16% opacity)
  if (logoImg && logoImg.width > 0) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    const centerWidth = Math.min(width * 0.45, 480);
    const centerHeight = (centerWidth * 499) / 973;
    const centerX = (width - centerWidth) / 2;
    const centerY = (height - centerHeight) / 2;
    ctx.drawImage(logoImg, centerX, centerY, centerWidth, centerHeight);
    ctx.restore();
  }

  // 2. Crisp, official Corner Watermark Badge (Bottom-Right)
  ctx.save();
  const cornerWidth = Math.max(110, Math.min(width * 0.22, 240));
  const cornerHeight = (cornerWidth * 499) / 973;
  const padding = Math.max(12, Math.round(width * 0.02));
  
  const padX = Math.round(cornerWidth * 0.08);
  const padY = Math.round(cornerHeight * 0.12);
  const pillWidth = cornerWidth + padX * 2;
  const pillHeight = cornerHeight + padY * 2;
  const pillX = width - pillWidth - padding;
  const pillY = height - pillHeight - padding;
  const radius = Math.max(8, Math.round(pillHeight * 0.22));

  // Draw luxury deep-emerald glass capsule
  drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, radius);
  ctx.fillStyle = 'rgba(2, 44, 30, 0.78)';
  ctx.fill();

  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.stroke();

  // Draw Logo inside capsule
  if (logoImg && logoImg.width > 0) {
    ctx.globalAlpha = 0.96;
    ctx.drawImage(logoImg, pillX + padX, pillY + padY, cornerWidth, cornerHeight);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(pillHeight * 0.32)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOVERIDGE', pillX + pillWidth / 2, pillY + pillHeight / 2);
  }
  ctx.restore();
}

/**
 * Client-side image compression and watermarking utility using HTML5 Canvas.
 * Resizes large image files to reasonable web dimensions and automatically
 * stamps the Loveridge logo watermark on every picture added.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8,
  watermark = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Return original data URL for non-scalable files like SVGs
    if (file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale dimensions down proportionally if larger than maximums
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Automatically apply Loveridge Logo Watermark
      if (watermark) {
        await applyLoveridgeWatermark(canvas, ctx);
      }

      // Output as JPEG for high quality compression
      const outputType = file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(outputType, quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * Watermarks an image from a URL or Base64 string and returns the watermarked DataURL.
 */
export async function watermarkImage(
  sourceUrlOrBase64: string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!sourceUrlOrBase64) {
      return reject(new Error('No image URL provided'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(sourceUrlOrBase64);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      await applyLoveridgeWatermark(canvas, ctx);

      const watermarkedUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(watermarkedUrl);
    };

    img.onerror = () => {
      // If crossOrigin blocks or image fails to load via canvas, safely return source
      resolve(sourceUrlOrBase64);
    };

    img.src = sourceUrlOrBase64;
  });
}
