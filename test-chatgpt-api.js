// Test ChatGPT API integration
const fetch = require("node-fetch");

async function testChatGPTAPI() {
  try {
    console.log("Testing ChatGPT API integration...");

    // Test with a simple analytics data
    const testData = {
      totalConferences: 5,
      totalAttendees: 150,
      totalSessions: 20,
      totalInteractions: 500,
      averageEngagement: 75.5,
      averageSatisfaction: 4.2,
      topPerformingConferences: [
        {
          id: 1,
          name: "Tech Conference 2024",
          attendees: 80,
          engagement: 85,
          satisfaction: 4.5,
          trend: "up",
        },
      ],
      globalTrends: [
        {
          metric: "Tổng tham dự",
          value: 150,
          change: 15.5,
          trend: "up",
        },
      ],
      demographics: {
        ageGroups: [{ range: "25-35", count: 80, percentage: 53 }],
        industries: [{ industry: "Technology", count: 90, percentage: 60 }],
      },
      monthlyStats: [
        {
          month: "2024-01",
          conferences: 2,
          attendees: 60,
          engagement: 70,
        },
      ],
    };

    // Test ChatGPT service directly
    const { chatGPTService } = require("./lib/chatgpt-service.js");

    console.log("Generating ChatGPT insights...");
    const result = await chatGPTService.generateAnalyticsInsights(testData);

    console.log("✅ ChatGPT API test successful!");
    console.log("Summary:", result.summary);
    console.log("Insights count:", result.insights.length);
    console.log("Recommendations count:", result.recommendations.length);
  } catch (error) {
    console.error("❌ ChatGPT API test failed:", error.message);

    if (error.message.includes("API key not configured")) {
      console.log("\n💡 To fix this:");
      console.log("1. Set OPENAI_API_KEY in your .env file");
      console.log("2. Get API key from https://platform.openai.com/");
    }
  }
}

testChatGPTAPI();
