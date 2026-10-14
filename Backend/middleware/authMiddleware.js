import { verifyToken } from "../services/authService.js";
export function authenticate(req, res, next) {
  const user = verifyToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!user) return res.status(401).json({ error: "Authentication required." });
  req.user = user;
  next();
}
