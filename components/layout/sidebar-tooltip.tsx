"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  const roleColors = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    attendee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 300; // max-width
      const tooltipHeight = 100; // estimated height
      const margin = 8;
      
      let left = rect.right + margin;
      let top = rect.top;
      
      // Check if tooltip would go off screen to the right
      if (left + tooltipWidth > window.innerWidth) {
        left = rect.left - tooltipWidth - margin;
      }
      
      // Check if tooltip would go off screen to the bottom
      if (top + tooltipHeight > window.innerHeight) {
        top = window.innerHeight - tooltipHeight - margin;
      }
      
      // Check if tooltip would go off screen to the top
      if (top < margin) {
        top = margin;
      }
      
      setPosition({ top, left });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipContent = isVisible && mounted && (
    <div 
      className={cn(
        "fixed z-[9999] min-w-[200px] max-w-[300px]",
        "bg-popover border border-border rounded-lg shadow-xl p-3",
        "animate-in slide-in-from-left-2 duration-200",
        "pointer-events-auto",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
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
  );

  return (
    <div 
      ref={triggerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {mounted && tooltipContent && createPortal(tooltipContent, document.body)}
    </div>
  );
}






