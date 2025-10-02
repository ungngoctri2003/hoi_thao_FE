"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionCheckin, Conference } from "@/lib/api/attendees-api";

interface SessionStatusBadgesProps {
  sessionCheckins: SessionCheckin[];
  conferences?: Conference[]; // List of conferences to show names
  conferenceId?: number; // Optional: filter by conference
  maxVisible?: number; // Maximum number of badges to show before using tooltip
}

const getSessionStatusBadge = (
  actionType: 'checkin' | 'checkout',
  sessionTitle: string,
  showFullTitle: boolean = false
) => {
  const config = {
    checkin: {
      icon: "✅",
      label: "Check-in",
      color: "bg-green-100 text-green-800 border-green-300",
    },
    checkout: {
      icon: "🚪",
      label: "Check-out",
      color: "bg-orange-100 text-orange-800 border-orange-300",
    },
  };

  const badgeConfig = config[actionType];
  
  // Truncate session title if too long and not showing full title
  const displayTitle = showFullTitle 
    ? sessionTitle 
    : sessionTitle.length > 20 
      ? sessionTitle.substring(0, 20) + '...' 
      : sessionTitle;
  
  return (
    <Badge 
      className={`${badgeConfig.color} text-xs whitespace-nowrap`} 
      variant="outline"
    >
      <span className="mr-1">{badgeConfig.icon}</span>
      {displayTitle}
    </Badge>
  );
};

export function SessionStatusBadges({
  sessionCheckins = [],
  conferences = [],
  conferenceId,
  maxVisible = 2,
}: SessionStatusBadgesProps) {
  // Filter by conference if specified
  const filteredCheckins = conferenceId
    ? sessionCheckins.filter((sc) => sc.CONFERENCE_ID === conferenceId)
    : sessionCheckins;

  // Group by session to get the latest status for each session
  const sessionMap = new Map<number, SessionCheckin>();
  
  filteredCheckins.forEach((checkin) => {
    const existing = sessionMap.get(checkin.SESSION_ID);
    if (!existing || new Date(checkin.CHECKIN_TIME) > new Date(existing.CHECKIN_TIME)) {
      sessionMap.set(checkin.SESSION_ID, checkin);
    }
  });

  const uniqueSessionCheckins = Array.from(sessionMap.values()).sort(
    (a, b) => new Date(b.CHECKIN_TIME).getTime() - new Date(a.CHECKIN_TIME).getTime()
  );

  // Helper function to get conference name
  const getConferenceName = (conferenceId: number) => {
    const conference = conferences.find((c) => c.ID === conferenceId);
    return conference?.NAME || `Hội nghị #${conferenceId}`;
  };

  // Group sessions by conference for better organization
  const sessionsByConference = new Map<number, SessionCheckin[]>();
  uniqueSessionCheckins.forEach((checkin) => {
    const confId = checkin.CONFERENCE_ID;
    if (!sessionsByConference.has(confId)) {
      sessionsByConference.set(confId, []);
    }
    sessionsByConference.get(confId)!.push(checkin);
  });

  if (uniqueSessionCheckins.length === 0) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Chưa check-in session nào
      </Badge>
    );
  }

  const visibleCheckins = uniqueSessionCheckins.slice(0, maxVisible);
  const remainingCheckins = uniqueSessionCheckins.slice(maxVisible);

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleCheckins.map((checkin) => (
        <TooltipProvider key={checkin.ID}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {getSessionStatusBadge(checkin.ACTION_TYPE, checkin.SESSION_TITLE, false)}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-1 text-xs">
                <div className="font-medium text-sm">
                  🏛️ {getConferenceName(checkin.CONFERENCE_ID)}
                </div>
                <div className="font-medium">
                  📋 {checkin.SESSION_TITLE}
                </div>
                <div className="text-muted-foreground">
                  <div>
                    ⏰ Session:{" "}
                    {new Date(checkin.SESSION_START_TIME).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(checkin.SESSION_END_TIME).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>
                    {checkin.ACTION_TYPE === "checkin" ? "✅" : "🚪"} {checkin.ACTION_TYPE === "checkin" ? "Check-in" : "Check-out"}:{" "}
                    {new Date(checkin.CHECKIN_TIME).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      {remainingCheckins.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-secondary/80"
              >
                +{remainingCheckins.length} session khác
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-2xl max-h-[32rem] overflow-y-auto">
              <div className="space-y-3">
                <p className="font-medium text-sm border-b pb-2">
                  📊 Tất cả session check-ins ({uniqueSessionCheckins.length})
                </p>
                
                {/* Group by conference */}
                {Array.from(sessionsByConference.entries()).map(([confId, checkins]) => (
                  <div key={confId} className="space-y-2">
                    <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        🏛️ {getConferenceName(confId)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {checkins.length} session{checkins.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 pl-4">
                      {checkins.map((checkin, index) => (
                        <div
                          key={checkin.ID}
                          className="flex items-start space-x-2 text-xs border-b pb-2 last:border-b-0"
                        >
                          <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                            {index + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <span className="font-medium">
                                📋 {checkin.SESSION_TITLE}
                              </span>
                              <Badge
                                className={
                                  checkin.ACTION_TYPE === "checkin"
                                    ? "bg-green-100 text-green-800 text-xs"
                                    : "bg-orange-100 text-orange-800 text-xs"
                                }
                                variant="outline"
                              >
                                {checkin.ACTION_TYPE === "checkin"
                                  ? "✅ Check-in"
                                  : "🚪 Check-out"}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground space-y-1">
                              <div>
                                ⏰ Thời gian session:{" "}
                                {new Date(checkin.SESSION_START_TIME).toLocaleString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {new Date(checkin.SESSION_END_TIME).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div>
                                🕐 Thời gian {checkin.ACTION_TYPE === "checkin" ? "check-in" : "check-out"}:{" "}
                                {new Date(checkin.CHECKIN_TIME).toLocaleString("vi-VN")}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>📱 Phương thức:</span>
                                <Badge variant="outline" className="text-xs">
                                  {checkin.METHOD === "qr"
                                    ? "📷 QR Code"
                                    : checkin.METHOD === "manual"
                                    ? "✍️ Thủ công"
                                    : "📡 NFC"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="text-xs text-muted-foreground pt-2 border-t flex items-center justify-between">
                  <span>Tổng cộng: {uniqueSessionCheckins.length} session</span>
                  <span>{sessionsByConference.size} hội nghị</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

