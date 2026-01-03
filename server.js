const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from root

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ reply: "⚠️ API Key missing. Please set GEMINI_API_KEY in .env file." });
    }

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a helpful assistant for a Road Trip Calculator app. You help users plan trips, estimate fuel, and give advice. Keep answers short and helpful." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to help with road trip planning, fuel costs, and advice." }],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error processing your request." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
