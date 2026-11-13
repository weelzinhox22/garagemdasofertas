import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.AUTOMATION_ADMIN_TOKEN || "";
  if (!value) throw new Error("AUTOMATION_ADMIN_TOKEN nao configurado");
  return value;
}

export function createOAuthState() {
  const payload = `${Date.now()}.${randomBytes(18).toString("hex")}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function validOAuthState(state: string) {
  const [timestamp, nonce, signature] = state.split(".");
  if (!timestamp || !nonce || !signature || Date.now() - Number(timestamp) > 10 * 60 * 1000) return false;
  const payload = `${timestamp}.${nonce}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
