/** 商品編號標準化，例如 oc00024 → OC00024 */
export function normalizeProductNo(productNo: string): string {
  return productNo.trim().toUpperCase().replace(/\s+/g, '');
}

/** 從 URL 或檔名解析圖片序號（OC00014 → 0，OC00014_2 → 2） */
export function parseProductImageIndex(productNo: string, urlOrName: string): number | null {
  const normalized = normalizeProductNo(productNo);
  const filename = urlOrName.split('/').pop()?.split('?')[0] || '';
  const base = filename.replace(/\.[^.]+$/i, '');

  if (base === normalized) return 0;

  const match = base.match(new RegExp(`^${escapeRegExp(normalized)}_(\\d+)$`, 'i'));
  if (match) return parseInt(match[1], 10);

  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 依現有圖片 URL 計算下一個檔名（OC00014.JPG / OC00014_1.JPG …） */
export function getNextProductImageFilename(
  productNo: string,
  existingUrls: string[],
  ext: string
): string {
  const normalized = normalizeProductNo(productNo);
  const safeExt = ext.replace(/^\./, '').toLowerCase() || 'jpg';

  let maxIndex = -1;
  for (const url of existingUrls) {
    const index = parseProductImageIndex(normalized, url);
    if (index !== null) {
      maxIndex = Math.max(maxIndex, index);
    }
  }

  const nextIndex = maxIndex + 1;
  if (nextIndex === 0) {
    return `${normalized}.${safeExt}`;
  }
  return `${normalized}_${nextIndex}.${safeExt}`;
}

export function buildProductImagePath(productNo: string, filename: string): string {
  const normalized = normalizeProductNo(productNo);
  return `products/${normalized}/${filename}`;
}

export function guessExtension(filename: string, mimeType: string): string {
  const fromName = filename.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'jpg';
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return '僅支援 JPG、PNG、WebP、GIF 格式';
  }
  if (file.size > 10 * 1024 * 1024) {
    return '單張圖片不能超過 10MB';
  }
  return null;
}
