const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to get client? No, need direct list.
    // Actually the SDK doesn't always expose listModels easily on the main entry, 
    // but usually we can try to just use a known one. 
    // Let's just try to output what we can find or just a simple test script.
    // Use the API key to checking.
    console.log("Checking API Key...");
    if (!process.env.GEMINI_API_KEY) {
        console.log("No API Key found in .env");
        return;
    }
    console.log("API Key present. Since I cannot list models easily with this SDK version directly without a valid model, I will try to generate with 'gemini-1.5-pro-latest' to see if it works.");
    
    // Test 1.5 Pro
    try {
        const model15 = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        await model15.generateContent("Test");
        console.log("SUCCESS: gemini-1.5-pro is working.");
    } catch (e) {
        console.log("FAIL: gemini-1.5-pro failed. " + e.message);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
