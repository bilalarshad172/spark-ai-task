import crypto from "node:crypto";
const secret = () =>
  process.env.JWT_SECRET || "development-only-secret-change-me";
export const createId = () => crypto.randomUUID();
export function signToken(payload) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 604800 }),
  ).toString("base64url");
  return (
    header +
    "." +
    body +
    "." +
    crypto
      .createHmac("sha256", secret())
      .update(header + "." + body)
      .digest("base64url")
  );
}
export function verifyToken(value) {
  try {
    const [header, body, signature] = (value || "").split(".");
    const expected = crypto
      .createHmac("sha256", secret())
      .update(header + "." + body)
      .digest("base64url");
    if (
      !header ||
      !body ||
      !signature ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return null;
    const payload = JSON.parse(Buffer.from(body, "base64url"));
    return payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}
export function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString("hex"),
) {
  return salt + ":" + crypto.scryptSync(password, salt, 64).toString("hex");
}
export function passwordMatches(password, stored) {
  const [salt, hash] = stored.split(":");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(hashPassword(password, salt).split(":")[1], "hex"),
  );
}
