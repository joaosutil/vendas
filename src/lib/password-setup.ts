import { prisma } from "@/lib/prisma";
import { randomToken, sha256 } from "@/lib/crypto";

const EXPIRES_IN_MINUTES = 30;

export async function createPasswordSetupToken(userId: string) {
  const rawToken = randomToken(24);
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000);

  await prisma.passwordSetupToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

export function hashSetupToken(rawToken: string) {
  return sha256(rawToken);
}
