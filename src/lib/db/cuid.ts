import { randomBytes } from "crypto";

/**
 * Small dependency-free id generator (cuid-like: time-sortable, URL safe).
 * Avoids pulling in an extra package just for primary keys.
 */
export function createId(): string {
  const time = Date.now().toString(36);
  const random = randomBytes(9).toString("base64url");
  return `c${time}${random}`;
}
