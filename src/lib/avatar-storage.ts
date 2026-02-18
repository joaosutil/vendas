import path from "node:path";

export const AVATAR_STORAGE_DIR = path.join(process.cwd(), "storage", "avatars");

export function getAvatarFilePath(fileName: string) {
  return path.join(AVATAR_STORAGE_DIR, fileName);
}

export function getAvatarApiUrl(fileName: string) {
  return `/api/members/account/avatar/${fileName}`;
}

export function extractAvatarFileName(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null;
  const apiPrefix = "/api/members/account/avatar/";
  const uploadsPrefix = "/uploads/avatars/";

  if (avatarUrl.startsWith(apiPrefix)) return avatarUrl.slice(apiPrefix.length).split("?")[0] || null;
  if (avatarUrl.startsWith(uploadsPrefix)) return avatarUrl.slice(uploadsPrefix.length).split("?")[0] || null;
  return null;
}
