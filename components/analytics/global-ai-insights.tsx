"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Zap, Settings, Activity } from "lucide-react";
import { memo, useCallback } from "react";

interface AIInsight {
  type: "trend" | "recommendation" | "alert" | "prediction";
  title: string;
  description: string;
  confidence: number;
  priority: "high" | "medium" | "low";
  conferenceId?: number;
  conferenceName?: string;
}

interface GlobalAIInsightsProps {
  insights: AIInsight[];
  isLoading: boolean;
}

const GlobalAIInsights = memo(function GlobalAIInsights({
  insights,
  isLoading,
}: GlobalAIInsightsProps) {
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getInsightIcon = useCallback((type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "recommendation":
        return <Zap className="h-5 w-5 text-yellow-600" />;
      case "alert":
        return <Settings className="h-5 w-5 text-red-600" />;
      case "prediction":
        return <Brain className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>Góc nhìn AI toàn cầu</span>
        </CardTitle>
        <CardDescription>
          Phân tích và gợi ý từ trí tuệ nhân tạo cho toàn bộ hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 border rounded-lg"
              >
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% tin cậy
                    </Badge>
                    {insight.conferenceName && (
                      <Badge variant="secondary">
                        {insight.conferenceName}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export { GlobalAIInsights };
