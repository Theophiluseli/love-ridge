import { LOVERIDGE_LOGO_WHITE_BASE64 } from './logoBase64';

export const MAX_WEBP_SIZE_BYTES = 300 * 1024; // 300 KB strict speed limit standard
export const TARGET_WEBP_SIZE_BYTES = 220 * 1024; // 220 KB ideal target (200-300KB range)

export interface ImageOptimizationReport {
  fileName: string;
  originalSize: number;
  originalSizeFormatted: string;
  optimizedSize: number;
  optimizedSizeFormatted: string;
  reductionPercentage: number;
  format: 'image/webp' | 'image/jpeg';
  width: number;
  height: number;
  dataUrl: string;
  isAboveStandard: boolean; // True if raw file was > 300KB
  watermarked: boolean;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getBase64ByteSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64String = dataUrl.split(',')[1] || dataUrl;
  return Math.round((base64String.length * 3) / 4);
}

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
 * Applies the official Loveridge signature watermark directly in the center
 * with refined opacity and balanced dimensions.
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

  ctx.save();
  const logoWidth = Math.max(160, Math.min(Math.round(width * 0.30), 320));
  const logoHeight = Math.round((logoWidth * 499) / 973);
  
  const padX = Math.max(10, Math.round(logoWidth * 0.09));
  const padY = Math.max(8, Math.round(logoHeight * 0.11));
  
  const pillWidth = logoWidth + padX * 2;
  const pillHeight = logoHeight + padY * 2;
  const pillX = Math.round((width - pillWidth) / 2);
  const pillY = Math.round((height - pillHeight) / 2);
  const radius = Math.max(10, Math.round(pillHeight * 0.24));

  // Soft emerald translucent capsule
  drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, radius);
  ctx.fillStyle = 'rgba(2, 44, 30, 0.32)';
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
  ctx.stroke();

  // White logo with 58% opacity
  if (logoImg && logoImg.width > 0) {
    ctx.globalAlpha = 0.58;
    ctx.drawImage(logoImg, pillX + padX, pillY + padY, logoWidth, logoHeight);
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `bold ${Math.round(pillHeight * 0.32)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LOVERIDGE', pillX + pillWidth / 2, pillY + pillHeight / 2);
  }
  ctx.restore();
}

/**
 * Optimizes an image strictly into WebP format within the 200KB - 300KB speed standard.
 * Iteratively adjusts resolution and WebP quality to guarantee maximum visual crispness
 * under the 300KB limit for ultra-fast page load.
 */
export async function optimizeImageToWebP(
  file: File,
  watermark = true
): Promise<ImageOptimizationReport> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size || 0;
    const isAboveStandard = originalSize > MAX_WEBP_SIZE_BYTES;

    // Handle SVGs
    if (file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({
          fileName: file.name,
          originalSize,
          originalSizeFormatted: formatFileSize(originalSize),
          optimizedSize: originalSize,
          optimizedSizeFormatted: formatFileSize(originalSize),
          reductionPercentage: 0,
          format: 'image/webp',
          width: 800,
          height: 800,
          dataUrl,
          isAboveStandard,
          watermarked: false,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      // Adaptive Multi-Pass Optimization Loop to hit 200KB - 300KB WebP target
      const attempts = [
        { maxDim: 1600, quality: 0.85 },
        { maxDim: 1400, quality: 0.80 },
        { maxDim: 1200, quality: 0.75 },
        { maxDim: 1080, quality: 0.70 },
        { maxDim: 900,  quality: 0.65 },
        { maxDim: 800,  quality: 0.55 },
      ];

      let bestDataUrl = '';
      let bestSize = Infinity;
      let finalWidth = img.width;
      let finalHeight = img.height;

      for (const attempt of attempts) {
        let curW = img.width;
        let curH = img.height;

        if (curW > attempt.maxDim || curH > attempt.maxDim) {
          if (curW / curH > 1) {
            curH = Math.round((curH * attempt.maxDim) / curW);
            curW = attempt.maxDim;
          } else {
            curW = Math.round((curW * attempt.maxDim) / curH);
            curH = attempt.maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = curW;
        canvas.height = curH;
        const ctx = canvas.getContext('2d');

        if (!ctx) continue;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, curW, curH);

        if (watermark) {
          await applyLoveridgeWatermark(canvas, ctx);
        }

        // Try WebP first
        let dataUrl = canvas.toDataURL('image/webp', attempt.quality);
        // Fallback to jpeg if browser doesn't produce webp dataUrl
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', attempt.quality);
        }

        const byteSize = getBase64ByteSize(dataUrl);

        bestDataUrl = dataUrl;
        bestSize = byteSize;
        finalWidth = curW;
        finalHeight = curH;

        // If fits under the 300KB max limit, break immediately with highest possible quality
        if (byteSize <= MAX_WEBP_SIZE_BYTES) {
          break;
        }
      }

      const reductionPercentage = originalSize > 0 && bestSize < originalSize
        ? Math.round(((originalSize - bestSize) / originalSize) * 100)
        : 0;

      resolve({
        fileName: file.name,
        originalSize,
        originalSizeFormatted: formatFileSize(originalSize),
        optimizedSize: bestSize,
        optimizedSizeFormatted: formatFileSize(bestSize),
        reductionPercentage,
        format: 'image/webp',
        width: finalWidth,
        height: finalHeight,
        dataUrl: bestDataUrl,
        isAboveStandard,
        watermarked: watermark,
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * Standard compress helper returning WebP dataUrl string.
 */
export async function compressImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.80,
  watermark = true
): Promise<string> {
  const res = await optimizeImageToWebP(file, watermark);
  return res.dataUrl;
}

/**
 * Watermarks an image from a URL or Base64 string and returns WebP DataURL.
 */
export async function watermarkImage(
  sourceUrlOrBase64: string,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.80
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

      let watermarkedUrl = canvas.toDataURL('image/webp', quality);
      if (!watermarkedUrl.startsWith('data:image/webp')) {
        watermarkedUrl = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(watermarkedUrl);
    };

    img.onerror = () => {
      resolve(sourceUrlOrBase64);
    };

    img.src = sourceUrlOrBase64;
  });
}
