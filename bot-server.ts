import axios from "axios";
import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

const APP_ID = "16707974c173ad0c7";
const REGION = "in";
const API_KEY = "0f3b20f0b1ad259b4eb5afc025113f779dbb276b";

// Note: CometChat doesn't support typing indicators via API for bots
// Typing indicators should be shown on the frontend when user sends a message to the bot
// The frontend should start showing typing indicator and stop when bot's response arrives

app.post("/", async (req: Request, res: Response) => {
  const payload = req.body;
  console.log("Payload is", payload);

  if (payload.trigger === "after_message") {
    const message = payload.data;
    const sender = message.sender;
    const text = message.data.text;
    const bot = payload.bot;

    const city = extractCity(text);
    
    if (!city) {
      await sendReply(bot, sender, "Please send a valid city name.");
      return res.sendStatus(200);
    }

    const weather = await getWeather(city);
    await sendReply(bot, sender, weather);
  }

  res.sendStatus(200);
});

const extractCity = (text: string) => {
  const match = text.match(/weather of (.*)/i);
  return match ? match[1].trim() : null;
};

const getWeather = async (city: string) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=7a5e11ce8ed89f4b89e45c5c7f651e3f&units=metric`;
    const response = await axios.get(url);
    const w = response.data;
    return `Weather in ${city}:
Temperature: ${w.main.temp}°C
Humidity: ${w.main.humidity}%
Condition: ${w.weather[0].description}`;
  } catch (err) {
    return `Sorry, I could not find weather for "${city}".`;
  }
};

const sendReply = async (
  botUid: string,
  receiverUid: string,
  textMessage: string
) => {
  const url = `https://api-${REGION}.cometchat.io/v3/bots/${botUid}/messages`;

  const body = {
    receiver: receiverUid,
    receiverType: "user",
    category: "message",
    type: "text",
    data: { text: textMessage },
  };

  const headers = {
    "Content-Type": "application/json",
    apiKey: API_KEY,
    appId: APP_ID,
  };

  try {
    const res = await axios.post(url, body, { headers });
    console.log("Message sent:", res.data);
  } catch (err) {
    console.error("Error sending message:", err.response?.data || err);
  }
};

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
