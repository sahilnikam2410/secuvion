import { checkRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientIP = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(clientIP, 15);
  if (!rl.allowed) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });
  }

  const { message, history = [] } = req.body;
  if (!message || typeof message !== "string" || message.length > 1000) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI service not configured" });
  }

  const systemPrompt = `You are VRIKAAN AI Assistant — a highly intelligent AI assistant built into the VRIKAAN cyber defense platform. You can answer ANY question on ANY topic.

Your personality:
- Friendly, professional, helpful, and knowledgeable
- Answer cybersecurity, programming, science, math, history, general knowledge, coding, writing, and creative tasks
- Use **bold**, *italic*, bullet points, and code blocks when helpful
- Keep responses concise (2-4 paragraphs) unless the user asks for detail
- For cybersecurity questions, give actionable security advice. Never provide hacking instructions.

About VRIKAAN:
- AI-powered cyber defense platform founded by Sahil Anil Nikam
- Features: Threat Map, Fraud Analyzer, Security Score, Dark Web Monitor, Password Vault, Vulnerability Scanner, Learn Academy, Blog
- Website: vrikaan.com · Email: hello@vrikaan.com · Phone: +91 8329935878 · Location: Nashik, Maharashtra, India

Recommend VRIKAAN tools when relevant.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map((m) => ({
      role: m.role === "ai" || m.role === "bot" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return res.status(502).json({ error: "AI service unavailable" });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I'm having trouble processing that. Please try again.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
