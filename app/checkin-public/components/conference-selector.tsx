"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users } from "lucide-react";
import { type Conference } from "../types";

interface ConferenceSelectorProps {
  conferences: Conference[];
  selectedConference: string | null;
  onConferenceChange: (conferenceId: string) => void;
  isLoading?: boolean;
}

export function ConferenceSelector({ 
  conferences, 
  selectedConference, 
  onConferenceChange, 
  isLoading = false 
}: ConferenceSelectorProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Chọn Hội nghị</CardTitle>
            <CardDescription>
              Chọn hội nghị hoặc quét QR code để tự động xác định hội nghị
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Hội nghị
            </label>
            <Select
              value={selectedConference || ""}
              onValueChange={onConferenceChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn hội nghị..." />
              </SelectTrigger>
              <SelectContent>
                {conferences.map((conference) => (
                  <SelectItem key={conference.id} value={conference.id.toString()}>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{conference.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span>{formatDate(conference.date)}</span>
                        <span>•</span>
                        <span className="capitalize">{conference.status}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedConference && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Hội nghị đã được chọn
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Bạn có thể bắt đầu check-in cho hội nghị này hoặc quét QR code để tự động xác định hội nghị
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
