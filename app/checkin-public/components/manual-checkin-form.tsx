"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  UserPlus
} from "lucide-react";

interface Attendee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  qrCode: string;
  conferenceId: number;
  isRegistered: boolean;
}

interface ManualCheckInFormProps {
  onCheckInSuccess: (attendee: Attendee) => void;
  onCheckInError: (error: string) => void;
  conferences: Array<{ id: number; name: string; date: string }>;
}

export function ManualCheckInForm({ onCheckInSuccess, onCheckInError, conferences }: ManualCheckInFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConference, setSelectedConference] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Attendee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    phone: "",
    qrCode: ""
  });
  const [error, setError] = useState("");

  // Search attendees using API
  const searchAttendees = async (query: string, conferenceId: string) => {
    if (!query.trim() || !conferenceId) return;
    
    setIsSearching(true);
    setError("");
    
    try {
      // Import checkInAPI dynamically to avoid circular dependency
      const { checkInAPI } = await import('../lib/checkin-api');
      const results = await checkInAPI.searchAttendees(query, parseInt(conferenceId));
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError("Lỗi khi tìm kiếm tham dự viên");
      onCheckInError("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim() || !selectedConference) {
      setError("Vui lòng nhập từ khóa tìm kiếm và chọn hội nghị");
      return;
    }
    searchAttendees(searchTerm, selectedConference);
  };

  const handleCheckIn = async (attendee: Attendee) => {
    setIsCheckingIn(true);
    setError("");
    
    try {
      // Import checkInAPI dynamically to avoid circular dependency
      const { checkInAPI } = await import('../lib/checkin-api');
      
      const response = await checkInAPI.checkInAttendee({
        attendeeId: attendee.id,
        qrCode: attendee.qrCode,
        conferenceId: attendee.conferenceId,
        checkInMethod: 'manual'
      });
      
      if (response.success && response.data) {
        onCheckInSuccess(attendee);
        setSelectedAttendee(null);
        setSearchResults([]);
        setSearchTerm("");
      } else {
        setError(response.message || "Lỗi khi check-in");
        onCheckInError("Check-in failed");
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError("Lỗi khi check-in");
      onCheckInError("Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualForm.name || !manualForm.email || !selectedConference) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    setIsCheckingIn(true);
    setError("");
    
    try {
      // Import checkInAPI dynamically to avoid circular dependency
      const { checkInAPI } = await import('../lib/checkin-api');
      
      const response = await checkInAPI.checkInAttendee({
        conferenceId: parseInt(selectedConference),
        checkInMethod: 'manual',
        attendeeInfo: {
          name: manualForm.name,
          email: manualForm.email,
          phone: manualForm.phone
        },
        qrCode: manualForm.qrCode || `MANUAL_${Date.now()}`
      });
      
      if (response.success && response.data) {
        const newAttendee: Attendee = {
          id: response.data.id,
          name: response.data.attendeeName,
          email: response.data.attendeeEmail,
          phone: manualForm.phone,
          qrCode: response.data.qrCode,
          conferenceId: parseInt(selectedConference),
          isRegistered: true
        };
        
        onCheckInSuccess(newAttendee);
        setManualForm({ name: "", email: "", phone: "", qrCode: "" });
        setShowManualForm(false);
      } else {
        setError(response.message || "Lỗi khi check-in thủ công");
        onCheckInError("Manual check-in failed");
      }
    } catch (err) {
      console.error('Manual check-in error:', err);
      setError("Lỗi khi check-in thủ công");
      onCheckInError("Manual check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Check-in Thủ công</span>
        </CardTitle>
        <CardDescription>
          Tìm kiếm và check-in tham dự viên bằng cách nhập thông tin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Conference Selection */}
          <div className="space-y-2">
            <Label htmlFor="conference">Chọn hội nghị *</Label>
            <Select value={selectedConference} onValueChange={setSelectedConference}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn hội nghị..." />
              </SelectTrigger>
              <SelectContent>
                {conferences.map((conference) => (
                  <SelectItem key={conference.id} value={conference.id.toString()}>
                    {conference.name} - {conference.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="search">Tìm kiếm tham dự viên</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nhập tên, email, số điện thoại hoặc QR code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchTerm.trim() || !selectedConference}
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
                <Label>Kết quả tìm kiếm ({searchResults.length})</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{attendee.name}</p>
                          <p className="text-sm text-muted-foreground">{attendee.email}</p>
                          {attendee.phone && (
                            <p className="text-xs text-muted-foreground">{attendee.phone}</p>
                          )}
                          <p className="text-xs text-muted-foreground">QR: {attendee.qrCode}</p>
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

            {/* Manual Check-in Form */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Check-in thủ công</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualForm(!showManualForm)}
                >
                  {showManualForm ? "Ẩn form" : "Hiện form"}
                </Button>
              </div>

              {showManualForm && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-name">Họ và tên *</Label>
                      <Input
                        id="manual-name"
                        placeholder="Nhập họ và tên..."
                        value={manualForm.name}
                        onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-email">Email *</Label>
                      <Input
                        id="manual-email"
                        type="email"
                        placeholder="Nhập email..."
                        value={manualForm.email}
                        onChange={(e) => setManualForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-phone">Số điện thoại</Label>
                      <Input
                        id="manual-phone"
                        placeholder="Nhập số điện thoại..."
                        value={manualForm.phone}
                        onChange={(e) => setManualForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-qr">Mã QR (tùy chọn)</Label>
                      <Input
                        id="manual-qr"
                        placeholder="Nhập mã QR..."
                        value={manualForm.qrCode}
                        onChange={(e) => setManualForm(prev => ({ ...prev, qrCode: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleManualCheckIn}
                    disabled={isCheckingIn || !manualForm.name || !manualForm.email || !selectedConference}
                    className="w-full"
                  >
                    {isCheckingIn ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Check-in thủ công
                  </Button>
                </div>
              )}
            </div>

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
