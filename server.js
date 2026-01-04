const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from root

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ reply: "⚠️ API Key missing. Please set OPENAI_API_KEY in .env file." });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant for a Road Trip Calculator app. You help users plan trips, estimate fuel, and give advice. Keep answers short and helpful." },
        { role: "user", content: userMessage }
      ],
      model: "gpt-4o", // Using the latest flagship model
    });

    const text = completion.choices[0].message.content;

    res.json({ reply: text });
  } catch (error) {
    console.error(error);
    if (error.status === 401) {
        res.json({ reply: "⚠️ Error: Invalid OpenAI API Key." });
    } else {
        res.status(500).json({ reply: "Error processing your request." });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
