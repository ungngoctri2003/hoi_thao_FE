"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarTooltipProps {
  children: React.ReactNode;
  content: string;
  description?: string;
  role?: string;
  className?: string;
}

export function SidebarTooltip({ 
  children, 
  content, 
  description, 
  role,
  className 
}: SidebarTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const roleColors = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    attendee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "absolute left-full top-0 ml-2 z-50 min-w-[200px] max-w-[300px]",
          "bg-popover border border-border rounded-lg shadow-lg p-3",
          "animate-in slide-in-from-left-2 duration-200",
          className
        )}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{content}</h4>
              {role && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", roleColors[role as keyof typeof roleColors])}
                >
                  {role}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute left-0 top-3 -ml-1 w-2 h-2 bg-popover border-l border-b border-border rotate-45"></div>
        </div>
      )}
    </div>
  );
}





