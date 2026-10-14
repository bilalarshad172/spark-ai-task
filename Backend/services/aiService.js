const SERVICES = "cleaning, checkup, consultation, therapy, haircut, follow-up";

const GREETING = /^\s*(hi|hello|hey|salam|assalam)\b/i;
const GOODBYE = /^\s*(?:bye|goodbye|see you|that'?s all|no thanks?|nope)\b[\s\S]{0,30}$/i;
const THANKS = /^\s*(?:thanks?|thank you|thx|ty|shukriya)\b[\s\S]{0,30}$/i;
const ACKNOWLEDGMENT =
  /^\s*(?:(?:ok(?:ay)?|sure|great|cool|perfect|nice|alright|got it|awesome|fine|good|yes|yeah|yep)[\s,.!]*)+$/i;

function extractDetails(text) {
  return {
    service:
      /\b(cleaning|check-?up|consultation|therapy|haircut|follow[- ]?up)\b/i.exec(text)?.[1] || null,
    date:
      /\b(day after tomorrow|today|tonight|tomorrow|(?:next\s)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\d{4}-\d{2}-\d{2}|\d{1,2}(?:st|nd|rd|th)?\s(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\b/i.exec(
        text,
      )?.[1] || null,
    // Needs HH:MM or an am/pm marker, so plain numbers like "2 haircuts" don't match.
    time:
      /\b((?:[01]?\d|2[0-3]):[0-5]\d\s?(?:am|pm)?|(?:1[0-2]|0?[1-9])\s?(?:am|pm))\b/i.exec(text)?.[1] || null,
  };
}

function getConversationDetails(history) {
  return history
    .filter(({ role }) => role === "user")
    .reduce(
      (details, { content }) => ({
        ...details,
        ...Object.fromEntries(
          Object.entries(extractDetails(content)).filter(([, value]) => value),
        ),
      }),
      { service: null, date: null, time: null },
    );
}

function missingFields(details) {
  return Object.entries(details)
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

function systemPrompt(details) {
  const known = Object.entries(details)
    .map(([key, value]) => `${key}: ${value || "not provided"}`)
    .join(", ");
  return [
    "You are a friendly, concise appointment assistant.",
    `Today is ${new Date().toDateString()}.`,
    `Available services: ${SERVICES}.`,
    "Reply naturally to greetings and general questions in one or two sentences.",
    "When the user wants to book, collect the service, date, and time. Ask only for what is missing.",
    `Details collected so far: ${known}.`,
    "Never say a booking is confirmed. Tell the user to use the booking panel to confirm.",
    "If the user says thanks, ok, sure, or goodbye, reply with a short friendly closing. Never repeat your previous message.",
    "If asked something unrelated to appointments, politely steer back to booking.",
  ].join(" ");
}

function fallbackReply(message, details) {
  if (GREETING.test(message))
    return "Hi! I can help you book an appointment. Which service would you like?";

  if (GOODBYE.test(message)) return "Goodbye! Have a great day.";

  if (THANKS.test(message))
    return "You're welcome! Let me know if you need anything else.";

  if (ACKNOWLEDGMENT.test(message)) {
    const missing = missingFields(details);
    return missing.length
      ? `Great! What ${missing.join(" and ")} would you prefer?`
      : "Great! Just confirm it in the booking panel whenever you're ready. Anything else I can help with?";
  }

  const wantsBooking =
    /book|appointment|schedule|reserve/i.test(message) ||
    details.service ||
    details.date ||
    details.time;
  if (!wantsBooking)
    return "I can help you book appointments. Tell me the service, date, and time you'd like.";

  const missing = missingFields(details);
  if (missing.length)
    return `Got it. What ${missing.join(" and ")} would you prefer?`;
  return `I found a ${details.service} request for ${details.date} at ${details.time}. Use the booking panel to confirm it.`;
}

export async function getAssistantReply(message, history) {
  // The controller adds the incoming message to history before calling us.
  const conversation = history.length ? history : [{ role: "user", content: message }];
  const details = getConversationDetails(conversation);

  if (process.env.MISTRAL_API_KEY) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.MISTRAL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || "mistral-small-latest",
          messages: [
            { role: "system", content: systemPrompt(details) },
            ...conversation.slice(-8).map(({ role, content }) => ({ role, content })),
          ],
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        console.info("AI interaction: Mistral");
        return {
          text: data.choices?.[0]?.message?.content?.trim() || "How can I help?",
          details,
        };
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        console.warn(
          `Mistral rate limit hit (429).${retryAfter ? ` Retry after ${retryAfter}s.` : ""} Using fallback.`,
        );
      } else {
        console.warn("Mistral error:", response.status, await response.text());
      }
    } catch (error) {
      console.warn("AI provider unavailable; fallback active.", error.message);
    }
  } else {
    console.warn("MISTRAL_API_KEY is not set; using fallback.");
  }

  console.info("AI interaction: fallback", details);
  return { details, text: fallbackReply(message, details) };
}