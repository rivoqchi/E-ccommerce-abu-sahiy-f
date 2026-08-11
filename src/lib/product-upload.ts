/** Max edge for product photos (px). Smaller sources are not upscaled. */
export const PRODUCT_IMAGE_SIZE = 1600;

/** Category circular thumbnails — smaller payload than product shots. */
export const CATEGORY_IMAGE_SIZE = 800;

/**
 * Center-crop any image to a square, then resize to at most `size`×`size`.
 * Does not upscale small images (keeps native sharpness).
 * PNG/WebP stay lossless-ish; JPEG uses high quality.
 */
export async function fileToSquareImageDataUrl(
  file: File,
  size: number,
  jpegQuality = 0.96,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Faqat rasm fayllari yuklanadi");
  }

  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  if (side < 1) {
    bitmap.close();
    throw new Error("Rasm o'qilmadi");
  }

  const sx = Math.floor((bitmap.width - side) / 2);
  const sy = Math.floor((bitmap.height - side) / 2);
  // Kichik rasmlarni kattalashtirmaymiz — xiralashishning asosiy sababi
  const out = Math.min(size, side);

  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas unavailable");
  }

  ctx.imageSmoothingEnabled = out < side;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out);
  bitmap.close();

  const type = file.type.toLowerCase();
  if (type === "image/png" || type === "image/webp") {
    return canvas.toDataURL("image/png");
  }
  return canvas.toDataURL("image/jpeg", jpegQuality);
}

/**
 * Center-crop to square and export at high quality (max PRODUCT_IMAGE_SIZE).
 */
export async function fileToProductImageDataUrl(file: File): Promise<string> {
  return fileToSquareImageDataUrl(file, PRODUCT_IMAGE_SIZE, 0.96);
}

export async function fileToCategoryImageDataUrl(file: File): Promise<string> {
  return fileToSquareImageDataUrl(file, CATEGORY_IMAGE_SIZE, 0.94);
}
