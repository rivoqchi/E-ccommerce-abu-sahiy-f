/** Fixed square size for all product photos (px). */
export const PRODUCT_IMAGE_SIZE = 800;

/**
 * Center-crop any image to a square, then resize to PRODUCT_IMAGE_SIZE×PRODUCT_IMAGE_SIZE JPEG.
 * Every product upload becomes the same dimensions so cards/modals never stretch.
 */
export async function fileToProductImageDataUrl(file: File): Promise<string> {
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
  const size = PRODUCT_IMAGE_SIZE;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas unavailable");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.88);
}
