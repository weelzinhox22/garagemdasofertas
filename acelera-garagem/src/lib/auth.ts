import { timingSafeEqual } from "node:crypto";

function equal(value: string, expected: string) {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function bearer(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
}

export function isAdmin(request: Request) {
  const expected = process.env.AUTOMATION_ADMIN_TOKEN || "";
  return Boolean(expected) && equal(bearer(request), expected);
}

export function isCron(request: Request) {
  const expected = process.env.CRON_SECRET || "";
  return Boolean(expected) && equal(bearer(request), expected);
}
