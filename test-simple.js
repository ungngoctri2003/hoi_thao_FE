// Simple test for ChatGPT integration
console.log("Testing ChatGPT integration...");

// Check if environment variables are set
const apiKey = process.env.OPENAI_API_KEY;
console.log("OpenAI API Key configured:", !!apiKey);

if (!apiKey) {
  console.log("❌ OPENAI_API_KEY not found in environment variables");
  console.log("Please set OPENAI_API_KEY in your .env file");
} else {
  console.log("✅ OPENAI_API_KEY is configured");
  console.log("Key starts with:", apiKey.substring(0, 10) + "...");
}

// Test basic functionality
try {
  const { chatGPTService } = require("./dist/services/chatgpt.service");
  console.log("✅ ChatGPT service loaded successfully");
} catch (error) {
  console.log("❌ Failed to load ChatGPT service:", error.message);
  console.log("Make sure to run: npm run build");
}
