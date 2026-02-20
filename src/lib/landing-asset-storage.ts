import path from "node:path";

export const LANDING_ASSET_STORAGE_DIR = path.join(process.cwd(), "storage", "landing");
export const LANDING_ASSET_LEGACY_PUBLIC_DIR = path.join(process.cwd(), "public", "uploads", "landing");

export function isSafeLandingAssetFileName(fileName: string) {
  return /^[a-zA-Z0-9._-]+$/.test(fileName) && !fileName.includes("..");
}

export function getLandingAssetStoragePath(fileName: string) {
  return path.join(LANDING_ASSET_STORAGE_DIR, fileName);
}

export function getLandingAssetLegacyPublicPath(fileName: string) {
  return path.join(LANDING_ASSET_LEGACY_PUBLIC_DIR, fileName);
}

export function getLandingAssetApiUrl(fileName: string) {
  return `/api/landing/assets/${fileName}`;
}

