import {
  createChatSession,
  getChatSession,
  updateChatSession,
} from "../services/dataService.js";
import { getAssistantReply } from "../services/aiService.js";
export async function createSession(req, res, next) {
  try {
    res.status(201).json({ session: await createChatSession(req.user.sub) });
  } catch (error) {
    next(error);
  }
}
export async function sendMessage(req, res, next) {
  try {
    const content = req.body.message?.trim();
    if (!content || content.length > 1500)
      return res
        .status(400)
        .json({ error: "Message must be 1-1500 characters." });
    const session = await getChatSession(req.params.id, req.user.sub);
    if (!session)
      return res.status(404).json({ error: "Chat session not found." });
    const messages =
      typeof session.messages === "string"
        ? JSON.parse(session.messages)
        : session.messages;
    messages.push({
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    });
    const reply = await getAssistantReply(content, messages);
    const message = {
      role: "assistant",
      content: reply.text,
      details: reply.details,
      createdAt: new Date().toISOString(),
    };
    messages.push(message);
    await updateChatSession({ ...session, messages });
    res.json({ message, sessionId: session.id });
  } catch (error) {
    next(error);
  }
}
