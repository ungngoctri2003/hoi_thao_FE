"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { memo, useCallback } from "react";

interface TopConference {
  id: number;
  name: string;
  attendees: number;
  engagement: number;
  satisfaction: number;
  trend: "up" | "down" | "stable";
}

interface TopConferencesProps {
  conferences: TopConference[];
  isLoading: boolean;
}

const TopConferences = memo(function TopConferences({
  conferences,
  isLoading,
}: TopConferencesProps) {
  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hội nghị hoạt động tốt nhất</CardTitle>
        <CardDescription>
          Xếp hạng các hội nghị theo hiệu suất tổng hợp
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {conferences.map((conference, index) => (
              <div
                key={conference.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-medium">{conference.name}</span>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{conference.attendees} tham dự</span>
                      <span>{conference.engagement}% tương tác</span>
                      <span>{conference.satisfaction}/5 hài lòng</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(conference.trend)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export { TopConferences };
