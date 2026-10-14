import { createUser, findUserByEmail } from "../services/dataService.js";
import {
  hashPassword,
  passwordMatches,
  signToken,
} from "../services/authService.js";
const validEmail = (email) => /^\S+@\S+\.\S+$/.test(email || "");
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});
export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !validEmail(email) || !password || password.length < 8)
      return res
        .status(400)
        .json({
          error:
            "Provide a name, valid email, and password of at least 8 characters.",
        });
    if (await findUserByEmail(email))
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    const user = await createUser({
      name: name.trim(),
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
    });
    res
      .status(201)
      .json({
        user: publicUser(user),
        token: signToken({ sub: user.id, email: user.email }),
      });
  } catch (error) {
    next(error);
  }
}
export async function login(req, res, next) {
  try {
    const user = await findUserByEmail(req.body.email || "");
    if (!user || !passwordMatches(req.body.password || "", user.password_hash))
      return res.status(401).json({ error: "Invalid email or password." });
    res.json({
      user: publicUser(user),
      token: signToken({ sub: user.id, email: user.email }),
    });
  } catch (error) {
    next(error);
  }
}
