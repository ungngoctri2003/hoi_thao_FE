// Free AI service using Hugging Face Inference API
interface HuggingFaceMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface HuggingFaceResponse {
  generated_text: string;
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

class FreeAIService {
  private apiUrl: string =
    "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
  private apiKey: string;

  constructor() {
    // Hugging Face API key (optional for free tier)
    this.apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || "";
  }

  private async callHuggingFace(prompt: string): Promise<string> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add API key if available (optional for free tier)
      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Hugging Face API error: ${response.status} ${response.statusText}`
        );
      }

      const data: HuggingFaceResponse[] = await response.json();
      return data[0]?.generated_text || "Không có phản hồi từ AI";
    } catch (error) {
      console.error("Hugging Face API error:", error);
      throw error;
    }
  }

  // Fallback AI using simple rule-based analysis
  private generateFallbackInsights(analyticsData: AnalyticsData): {
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
  } {
    const insights = [];
    const recommendations = [];
    let summary = "";

    // Analyze engagement trends
    if (analyticsData.averageEngagement > 80) {
      insights.push({
        type: "trend",
        title: "Tỷ lệ tương tác cao",
        description: `Tỷ lệ tương tác trung bình ${analyticsData.averageEngagement}% cho thấy sự tham gia tích cực của tham dự viên.`,
        confidence: 85,
        priority: "high",
      });
    } else if (analyticsData.averageEngagement < 50) {
      insights.push({
        type: "alert",
        title: "Tỷ lệ tương tác thấp",
        description: `Tỷ lệ tương tác ${analyticsData.averageEngagement}% cần được cải thiện để tăng sự tham gia.`,
        confidence: 90,
        priority: "high",
      });
      recommendations.push(
        "Tổ chức các hoạt động tương tác nhiều hơn trong hội nghị"
      );
    }

    // Analyze satisfaction
    if (analyticsData.averageSatisfaction > 4.0) {
      insights.push({
        type: "trend",
        title: "Mức độ hài lòng tốt",
        description: `Điểm hài lòng trung bình ${analyticsData.averageSatisfaction}/5 cho thấy chất lượng hội nghị tốt.`,
        confidence: 80,
        priority: "medium",
      });
    } else if (analyticsData.averageSatisfaction < 3.0) {
      insights.push({
        type: "alert",
        title: "Mức độ hài lòng cần cải thiện",
        description: `Điểm hài lòng ${analyticsData.averageSatisfaction}/5 cần được nâng cao.`,
        confidence: 85,
        priority: "high",
      });
      recommendations.push("Cải thiện chất lượng nội dung và dịch vụ hội nghị");
    }

    // Analyze conference performance
    const topConference = analyticsData.topPerformingConferences[0];
    if (topConference) {
      insights.push({
        type: "prediction",
        title: "Hội nghị xuất sắc",
        description: `"${topConference.name}" với ${topConference.attendees} tham dự viên và ${topConference.engagement}% tương tác là hội nghị hoạt động tốt nhất.`,
        confidence: 75,
        priority: "medium",
        conferenceId: topConference.id,
        conferenceName: topConference.name,
      });
    }

    // Analyze demographics
    const topAgeGroup = analyticsData.demographics.ageGroups[0];
    if (topAgeGroup) {
      insights.push({
        type: "trend",
        title: "Phân bố độ tuổi",
        description: `Nhóm tuổi ${topAgeGroup.range} chiếm ${topAgeGroup.percentage}% tham dự viên.`,
        confidence: 70,
        priority: "low",
      });
    }

    // Generate summary
    summary = `Hệ thống đã phân tích ${analyticsData.totalConferences} hội nghị với ${analyticsData.totalAttendees} tham dự viên. `;
    summary += `Tỷ lệ tương tác trung bình ${analyticsData.averageEngagement}% và điểm hài lòng ${analyticsData.averageSatisfaction}/5. `;

    if (analyticsData.averageEngagement > 70) {
      summary +=
        "Tình hình hoạt động tích cực với sự tham gia cao của tham dự viên.";
    } else {
      summary +=
        "Cần có biện pháp cải thiện để tăng sự tham gia và hài lòng của tham dự viên.";
    }

    // Add more recommendations
    if (analyticsData.totalConferences > 10) {
      recommendations.push(
        "Xem xét tổ chức hội nghị chuyên đề để tăng chất lượng"
      );
    }

    if (analyticsData.averageSatisfaction < 4.0) {
      recommendations.push(
        "Thu thập phản hồi chi tiết từ tham dự viên để cải thiện"
      );
    }

    recommendations.push("Sử dụng công nghệ để tăng tương tác trong hội nghị");
    recommendations.push(
      "Phân tích dữ liệu tham dự viên để tối ưu hóa nội dung"
    );

    return {
      insights,
      summary,
      recommendations,
    };
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
    try {
      // Try Hugging Face API first
      const prompt = `Phân tích dữ liệu hội nghị: ${analyticsData.totalConferences} hội nghị, ${analyticsData.totalAttendees} tham dự viên, tỷ lệ tương tác ${analyticsData.averageEngagement}%, điểm hài lòng ${analyticsData.averageSatisfaction}/5. Đưa ra insights và gợi ý cải thiện.`;

      const response = await this.callHuggingFace(prompt);

      // Parse the response and create structured insights
      const insights = [
        {
          type: "trend" as const,
          title: "Phân tích AI miễn phí",
          description: response,
          confidence: 75,
          priority: "medium" as const,
        },
      ];

      return {
        insights,
        summary: "Phân tích được thực hiện bởi AI miễn phí (Hugging Face).",
        recommendations: [
          "Sử dụng AI miễn phí để phân tích dữ liệu",
          "Cải thiện chất lượng hội nghị dựa trên insights",
        ],
      };
    } catch (error) {
      console.error("Free AI service error:", error);

      // Fallback to rule-based analysis
      console.log("Falling back to rule-based analysis...");
      return this.generateFallbackInsights(analyticsData);
    }
  }

  async generateConferenceRecommendations(
    conferenceId: number,
    conferenceName: string,
    data: any
  ): Promise<string[]> {
    try {
      const prompt = `Đưa ra gợi ý cải thiện cho hội nghị "${conferenceName}" với ${data.attendees} tham dự viên, tỷ lệ tương tác ${data.engagement}%, điểm hài lòng ${data.satisfaction}/5.`;

      const response = await this.callHuggingFace(prompt);

      // Split response into recommendations
      const lines = response.split("\n").filter((line) => line.trim());
      return lines.slice(0, 5);
    } catch (error) {
      console.error("Error generating conference recommendations:", error);

      // Fallback recommendations
      const recommendations = [];

      if (data.engagement < 70) {
        recommendations.push(
          "Tăng cường các hoạt động tương tác trong hội nghị"
        );
      }

      if (data.satisfaction < 4.0) {
        recommendations.push("Cải thiện chất lượng nội dung và dịch vụ");
      }

      recommendations.push(
        "Sử dụng công nghệ để tăng trải nghiệm tham dự viên"
      );
      recommendations.push("Thu thập phản hồi để cải thiện hội nghị tiếp theo");

      return recommendations;
    }
  }
}

export const freeAIService = new FreeAIService();
