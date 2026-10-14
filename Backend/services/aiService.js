function extractDetails(text) {
  const lower = text.toLowerCase();
  return {
    service:
      /(?:cleaning|checkup|consultation|therapy|haircut|follow.?up)/.exec(
        lower,
      )?.[0] || null,
    date:
      /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}-\d{2}-\d{2})\b/i.exec(
        text,
      )?.[0] || null,
    time:
      /\b(?:[01]?\d|2[0-3])(?::[0-5]\d)?\s?(?:am|pm)?\b/i.exec(text)?.[0] ||
      null,
  };
}
export async function getAssistantReply(message, history) {
  const details = extractDetails(message);
  if (process.env.MISTRAL_API_KEY)
    try {
      const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.MISTRAL_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.MISTRAL_MODEL || "mistral-small-latest",
            messages: [
              {
                role: "system",
                content:
                  "You are a concise appointment assistant. Ask for service, date, and time if absent. Never say a booking is confirmed.",
              },
              ...history
                .slice(-8)
                .map(({ role, content }) => ({ role, content })),
              { role: "user", content: message },
            ],
            temperature: 0.2,
          }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        console.info("AI interaction: Mistral");
        return {
          text: data.choices?.[0]?.message?.content || "How can I help?",
          details,
        };
      }
    } catch (error) {
      console.warn("AI provider unavailable; fallback active.", error.message);
    }
  const missing = Object.entries(details)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  console.info("AI interaction: fallback", details);
  return {
    details,
    text: missing.length
      ? "I can help with that. What " +
        missing.join(" and ") +
        " would you prefer?"
      : "I found a " +
        details.service +
        " request for " +
        details.date +
        " at " +
        details.time +
        ". Use the booking panel to confirm it.",
  };
}
