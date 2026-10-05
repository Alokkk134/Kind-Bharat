"use client";

import imageCompression from "browser-image-compression";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type CompressPreset = { maxKB: number; maxWidth: number };

export const PRESETS = {
  certificate: { maxKB: 300, maxWidth: 1600 },
  screenshot: { maxKB: 150, maxWidth: 1200 },
  photo: { maxKB: 200, maxWidth: 1200 },
  logo: { maxKB: 50, maxWidth: 400 },
  qr: { maxKB: 100, maxWidth: 800 },
} satisfies Record<string, CompressPreset>;

/** Shrink a phone photo to WebP under the size limit. Throws a friendly error if impossible. */
export async function compressImage(file: File, preset: CompressPreset): Promise<File> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG or WebP image.");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("This image is too big (over 25 MB). Please choose a smaller one.");
  }
  let width = preset.maxWidth;
  for (let attempt = 0; attempt < 4; attempt++) {
    const out = await imageCompression(file, {
      maxSizeMB: (preset.maxKB / 1024) * 0.95,
      maxWidthOrHeight: width,
      fileType: "image/webp",
      initialQuality: attempt === 0 ? 0.82 : 0.7,
      useWebWorker: true,
    });
    if (out.size <= preset.maxKB * 1024) {
      return new File([out], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
    }
    width = Math.round(width * 0.8);
  }
  throw new Error(`Could not shrink this image below ${preset.maxKB} KB. Try a different photo.`);
}
