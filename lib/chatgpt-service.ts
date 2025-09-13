// AI service for generating insights (using free AI alternatives)
const { freeAIService } = require("./free-ai-service.js");
interface ChatGPTMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AnalyticsData {
  totalConferences: number;
  totalAttendees: number;
  totalSessions: number;
  totalInteractions: number;
  averageEngagement: number;
  averageSatisfaction: number;
  topPerformingConferences: Array<{
    id: number;
    name: string;
    attendees: number;
    engagement: number;
    satisfaction: number;
    trend: "up" | "down" | "stable";
  }>;
  globalTrends: Array<{
    metric: string;
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  }>;
  demographics: {
    ageGroups: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    industries: Array<{
      industry: string;
      count: number;
      percentage: number;
    }>;
  };
  monthlyStats: Array<{
    month: string;
    conferences: number;
    attendees: number;
    engagement: number;
  }>;
}

class ChatGPTService {
  private useFreeAI: boolean = true; // Always use free AI now

  constructor() {
    // Check if we should use free AI (always true now)
    this.useFreeAI = true;
  }

  async generateAnalyticsInsights(analyticsData: AnalyticsData): Promise<{
    insights: Array<{
      type: "trend" | "recommendation" | "alert" | "prediction";
      title: string;
      description: string;
      confidence: number;
      priority: "high" | "medium" | "low";
      conferenceId?: number;
      conferenceName?: string;
    }>;
    summary: string;
    recommendations: string[];
  }> {
    // Always use free AI service now
    try {
      console.log("Using free AI service for analytics insights...");
      return await freeAIService.generateAnalyticsInsights(analyticsData);
    } catch (error) {
      console.error("Error generating AI insights:", error);

      // Fallback insights if AI fails
      return {
        insights: [
          {
            type: "alert",
            title: "AI miễn phí",
            description:
              "Đang sử dụng AI miễn phí để phân tích dữ liệu hội nghị.",
            confidence: 100,
            priority: "low",
          },
        ],
        summary: "Dữ liệu hội nghị đang được phân tích bởi AI miễn phí...",
        recommendations: [
          "Sử dụng AI miễn phí để phân tích dữ liệu",
          "Cải thiện chất lượng hội nghị dựa trên insights",
        ],
      };
    }
  }

  async generateConferenceRecommendations(
    conferenceId: number,
    conferenceName: string,
    data: any
  ): Promise<string[]> {
    try {
      console.log("Using free AI service for conference recommendations...");
      return await freeAIService.generateConferenceRecommendations(
        conferenceId,
        conferenceName,
        data
      );
    } catch (error) {
      console.error("Error generating conference recommendations:", error);
      return ["Không thể tạo gợi ý tại thời điểm này"];
    }
  }
}

export const chatGPTService = new ChatGPTService();
