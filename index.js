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

    const mistralResponse = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content:
              "You are SturdyFin AI, a calm and helpful finance education assistant for Indian users. Explain financial concepts clearly, safely, and simply. Avoid giving direct investment advice."
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
      text: reply
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