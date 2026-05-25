import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message?.text) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
const userText = message.text;

console.log("User message:", userText);

if (userText.startsWith("/start")) {

  if (userText.includes("website")) {
    console.log("User came from website");
  }

  if (userText.includes("instagram")) {
    console.log("User came from Instagram");
  }

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text:
      "Welcome to SturdyFin AI 🚀\n\nAsk me about SIPs, insurance, taxes, budgeting, mutual funds, credit scores, loans, and personal finance."
  });

  return res.sendStatus(200);
}

    const mistralResponse = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-small-latest",
        messages: [
          {
  role: "system",
  content: `
You are SturdyFin AI, a finance education assistant for Indian users.

Your job is ONLY to answer topics related to:
- personal finance
- insurance
- loans
- mutual funds
- SIP
- taxes
- budgeting
- savings
- credit score
- investing basics
- banking
- financial planning

If users ask anything outside finance,
politely refuse and redirect them back to finance topics.

Keep answers:
- beginner friendly
- practical
- concise
- trustworthy
- calm and modern

When users ask follow-up questions,
assume they are referring to the most recent finance topic discussed.

If the user's message is short or refers to previous context like:
- yes
- okay
- tell me more
- continue
- which one
- explain more

then intelligently continue the previous finance topic instead of resetting the conversation.

Never use **asterisks** for formatting.

Use:
- short paragraphs
- bullets when needed
- simple Telegram-friendly formatting

Avoid huge blocks of text.

Encourage users to learn more through SturdyFin.

Always remind users to verify financial decisions with qualified professionals.

Never give guaranteed returns.
Never give direct investment advice.
Never promote risky financial behavior.`
},
          {
            role: "user",
            content: userText
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      mistralResponse.data.choices[0].message.content;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
  chat_id: chatId,
  text: reply,
  parse_mode: "Markdown"
});

    res.sendStatus(200);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("SturdyFin bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});