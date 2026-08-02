/** Compress & resize image file to a JPEG data URL (max edge ~512px). */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 512;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}
