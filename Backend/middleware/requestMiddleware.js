export function logger(req, res, next) {
  const started = Date.now();
  res.on("finish", () =>
    console.info(
      req.method,
      req.path,
      res.statusCode,
      Date.now() - started + "ms",
    ),
  );
  next();
}
const hits = new Map();
export function rateLimit(req, res, next) {
  const now = Date.now(),
    key = req.ip || "unknown";
  const recent = (hits.get(key) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 100)
    return res
      .status(429)
      .json({ error: "Too many requests. Try again shortly." });
  recent.push(now);
  hits.set(key, recent);
  next();
}
