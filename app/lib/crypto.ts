import crypto from "crypto";

const KEY = process.env.TESLA_TOKEN_ENC_KEY; // 32bytes推奨（base64やhexではなく素でOK）
if (!KEY || KEY.length < 32) {
  // 起動時に気づけるように
  console.warn("TESLA_TOKEN_ENC_KEY is missing or too short (need >=32 chars)");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const key = Buffer.from((KEY ?? "x".repeat(32)).slice(0, 32), "utf8");
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // iv.tag.data を base64でまとめる
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(b64: string): string {
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const key = Buffer.from((KEY ?? "x".repeat(32)).slice(0, 32), "utf8");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}
