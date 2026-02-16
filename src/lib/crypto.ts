import crypto from "node:crypto";

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}
