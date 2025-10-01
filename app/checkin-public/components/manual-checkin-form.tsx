"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";
import { type Attendee } from "../types";

interface ManualCheckInFormProps {
  onCheckInSuccess: (attendee: Attendee) => void;
  onCheckInError: (error: string) => void;
  conferences: Array<{ id: number; name: string; date: string }>;
  actionType?: "checkin" | "checkout"; // Action type: checkin or checkout
}

export function ManualCheckInForm({
  onCheckInSuccess,
  onCheckInError,
  conferences,
  actionType = "checkin", // Default to checkin
}: ManualCheckInFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConference, setSelectedConference] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Attendee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(
    null
  );
  const [error, setError] = useState("");

  // Search attendees using API across all conferences
  const searchAttendees = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError("");

    try {
      // Import checkInAPI dynamically to avoid circular dependency
      const { checkInAPI } = await import("../lib/checkin-api");
      console.log("Searching for:", query, "across all conferences");

      // Search in all conferences
      const allResults: Attendee[] = [];
      for (const conference of conferences) {
        try {
          const results = await checkInAPI.searchAttendees(
            query,
            conference.id
          );
          allResults.push(...results);
        } catch (err) {
          console.warn(`Search failed for conference ${conference.id}:`, err);
        }
      }

      console.log("Search results:", allResults);
      setSearchResults(allResults);
    } catch (err) {
      console.error("Search error:", err);
      setError("Lỗi khi tìm kiếm tham dự viên");
      onCheckInError("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setError("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }
    searchAttendees(searchTerm);
  };

  const handleCheckIn = async (attendee: Attendee) => {
    setIsCheckingIn(true);
    setError("");

    try {
      // Import checkInAPI dynamically to avoid circular dependency
      const { checkInAPI } = await import("../lib/checkin-api");

      const response = await checkInAPI.checkInAttendee({
        attendeeId: attendee.id,
        qrCode: attendee.qrCode,
        conferenceId: attendee.conferenceId,
        checkInMethod: "manual",
        actionType: actionType, // Send action type
      });

      if (response.success && response.data) {
        onCheckInSuccess(attendee);
        setSelectedAttendee(null);
        setSearchResults([]);
        setSearchTerm("");

        // Show success message
        setError(""); // Clear any previous errors
      } else {
        setError(response.message || "Lỗi khi check-in");
        onCheckInError("Check-in failed");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      setError("Lỗi khi check-in");
      onCheckInError("Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Refresh search results after check-in
  const refreshSearchResults = async () => {
    if (searchTerm.trim()) {
      await searchAttendees(searchTerm);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Check-in Thủ công</span>
        </CardTitle>
        <CardDescription>
          Tìm kiếm và check-in tham dự viên bằng cách nhập thông tin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="search">Tìm kiếm tham dự viên</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nhập tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Tìm kiếm
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Kết quả tìm kiếm ({searchResults.length})</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshSearchResults}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-1" />
                    )}
                    Làm mới
                  </Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{attendee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {attendee.email}
                          </p>
                          {attendee.phone && (
                            <p className="text-xs text-muted-foreground">
                              {attendee.phone}
                            </p>
                          )}
                          <p className="text-xs text-blue-600 font-medium">
                            Hội nghị:{" "}
                            {conferences.find(
                              (c) => c.id === attendee.conferenceId
                            )?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {attendee.isRegistered ? (
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(attendee)}
                            disabled={isCheckingIn}
                          >
                            {isCheckingIn ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Check-in
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Chưa đăng ký</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
