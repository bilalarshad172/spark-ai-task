import { Router } from "express";
import { createSession, sendMessage } from "../controllers/chatController.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = Router();
router.use(authenticate);
router.post("/sessions", createSession);
router.post("/sessions/:id/messages", sendMessage);
export default router;
