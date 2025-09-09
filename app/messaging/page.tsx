"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useMessaging } from "@/hooks/use-messaging";
import { 
  MessageCircle, 
  Search, 
  Send, 
  Users, 
  Clock,
  Phone,
  Mail,
  Briefcase,
  Star,
  Heart,
  Share2,
  MoreVertical,
  Paperclip,
  Smile,
  X,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file";
  isRead: boolean;
}

interface ChatContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  lastMessage?: string;
  unreadCount: number;
  conferenceId: number;
}

export default function MessagingPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [searchMode, setSearchMode] = useState<'conference' | 'global'>('conference');
  
  // Use messaging hook - for now using conference ID 1 as default
  // In a real app, this would come from URL params or context
  const {
    contacts,
    messages,
    selectedContact,
    isLoading,
    error,
    isConnected,
    selectContact,
    sendMessage,
    searchContacts,
    searchAllUsers,
    resetSearch,
    clearError
  } = useMessaging({ conferenceId: 1 });

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search is empty, reset to show all contacts
      resetSearch();
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchMode === 'global') {
        searchAllUsers(searchTerm);
      } else {
        searchContacts(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchMode]); // Add searchMode to dependencies

  const handleSelectContact = (contact: ChatContact) => {
    selectContact(contact);
    setShowChat(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Show loading state while auth is loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Chưa đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Vui lòng đăng nhập để truy cập trang này
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Get user info for MainLayout
  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;
  // Messaging is now a main feature, not conference-specific
  // No need to check conference permissions

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* WebSocket Status - Only show if there's an actual error */}
        {!isConnected && error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800">Tin nhắn có thể không được đồng bộ real-time</span>
          </div>
        )}
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MessageCircle className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Tin nhắn</h1>
                <p className="text-muted-foreground">
                  Nhắn tin với những người tham dự hội nghị
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ liên hệ
              </Button>
              <Button 
                variant={searchMode === 'global' ? 'default' : 'outline'}
                onClick={() => setSearchMode(searchMode === 'global' ? 'conference' : 'global')}
              >
                <Users className="h-4 w-4 mr-2" />
                {searchMode === 'global' ? 'Tìm trong hội nghị' : 'Tìm toàn hệ thống'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Tổng cuộc trò chuyện</p>
                    <p className="text-2xl font-bold">{contacts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Tin nhắn hôm nay</p>
                    <p className="text-2xl font-bold">{messages.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Đang hoạt động</p>
                    <p className="text-2xl font-bold">
                      {contacts.filter(c => c.isOnline).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Chưa đọc</p>
                    <p className="text-2xl font-bold">
                      {contacts.reduce((sum, c) => sum + c.unreadCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contacts List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cuộc trò chuyện</CardTitle>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={
                        searchMode === 'global' 
                          ? "Tìm kiếm người dùng toàn hệ thống..." 
                          : "Tìm kiếm cuộc trò chuyện..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge variant="secondary" className="text-xs">
                          {searchMode === 'global' ? 'Toàn hệ thống' : 'Hội nghị'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedContact?.id === contact.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {contact.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">{contact.name}</h3>
                            <div className="flex items-center space-x-2">
                              {contact.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {contact.unreadCount}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatTime(new Date())}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.company ? `${contact.position} tại ${contact.company}` : contact.position}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.lastMessage || "Chưa có tin nhắn"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              {selectedContact ? (
                <Card className="h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <CardHeader className="flex-shrink-0 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
                            <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {selectedContact.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {selectedContact.company ? `${selectedContact.position} tại ${selectedContact.company}` : selectedContact.position}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {selectedContact.isOnline ? "Đang hoạt động" : selectedContact.lastSeen}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => {
                        // For messaging, we consider a message as "from current user" if attendeeId is null
                        // This is because in the messaging system, null attendeeId means current user sent it
                        const isCurrentUser = message.attendeeId === null;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {formatTime(new Date(message.timestamp))}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder="Nhập tin nhắn..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
                    <p className="text-muted-foreground">
                      Chọn một người từ danh sách để bắt đầu trò chuyện
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Messaging Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Mẹo nhắn tin hiệu quả</CardTitle>
              <CardDescription>
                Cách tối ưu hóa trải nghiệm giao tiếp tại hội nghị
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Giao tiếp chuyên nghiệp</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sử dụng ngôn ngữ lịch sự và chuyên nghiệp</li>
                    <li>• Trả lời tin nhắn trong thời gian hợp lý</li>
                    <li>• Chia sẻ thông tin hữu ích và có giá trị</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Tối ưu hóa kết nối</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Đặt câu hỏi mở để khuyến khích thảo luận</li>
                    <li>• Chia sẻ kinh nghiệm và kiến thức</li>
                    <li>• Theo dõi và duy trì mối quan hệ lâu dài</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </MainLayout>
  );
}
