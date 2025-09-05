"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/layout/public-header";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Star,
  Bookmark,
  Share2,
  Filter,
  Search
} from "lucide-react";

export default function SessionsPublicPage() {
  const [selectedDay, setSelectedDay] = useState("day1");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");

  const conferenceDays = [
    {
      id: "day1",
      date: "20/12/2024",
      day: "Thứ 6",
      sessions: [
        {
          id: 1,
          title: "Keynote: Tương lai của AI trong doanh nghiệp",
          speaker: "TS. Nguyễn Văn An",
          time: "09:00 - 10:30",
          room: "Hội trường A",
          track: "AI & Machine Learning",
          description: "Khám phá xu hướng AI mới nhất và ứng dụng thực tế trong doanh nghiệp",
          capacity: 500,
          registered: 450,
          status: "live",
          tags: ["AI", "Machine Learning", "Keynote"]
        },
        {
          id: 2,
          title: "Workshop: Xây dựng ứng dụng React hiện đại",
          speaker: "Trần Thị Bình",
          time: "11:00 - 12:30",
          room: "Phòng họp 201",
          track: "Frontend Development",
          description: "Hands-on workshop về React Hooks, Context API và performance optimization",
          capacity: 100,
          registered: 95,
          status: "upcoming",
          tags: ["React", "Frontend", "Workshop"]
        },
        {
          id: 3,
          title: "Blockchain và Fintech: Cơ hội mới",
          speaker: "Lê Minh Cường",
          time: "14:00 - 15:30",
          room: "Phòng họp 202",
          track: "Blockchain",
          description: "Tìm hiểu về blockchain và ứng dụng trong lĩnh vực tài chính",
          capacity: 80,
          registered: 78,
          status: "upcoming",
          tags: ["Blockchain", "Fintech", "Crypto"]
        }
      ]
    },
    {
      id: "day2",
      date: "21/12/2024",
      day: "Thứ 7",
      sessions: [
        {
          id: 4,
          title: "Cloud Computing: Best Practices",
          speaker: "Phạm Thị Dung",
          time: "09:00 - 10:30",
          room: "Hội trường A",
          track: "Cloud & DevOps",
          description: "Chia sẻ kinh nghiệm triển khai và quản lý hệ thống cloud",
          capacity: 500,
          registered: 420,
          status: "upcoming",
          tags: ["Cloud", "DevOps", "AWS"]
        },
        {
          id: 5,
          title: "Panel: Tương lai của Web Development",
          speaker: "Nhiều diễn giả",
          time: "11:00 - 12:30",
          room: "Hội trường A",
          track: "Web Development",
          description: "Thảo luận về xu hướng và tương lai của web development",
          capacity: 500,
          registered: 380,
          status: "upcoming",
          tags: ["Web", "Panel", "Discussion"]
        }
      ]
    }
  ];

  const tracks = [
    { id: "all", name: "Tất cả", color: "bg-gray-100 text-gray-800" },
    { id: "AI & Machine Learning", name: "AI & ML", color: "bg-blue-100 text-blue-800" },
    { id: "Frontend Development", name: "Frontend", color: "bg-green-100 text-green-800" },
    { id: "Blockchain", name: "Blockchain", color: "bg-purple-100 text-purple-800" },
    { id: "Cloud & DevOps", name: "Cloud", color: "bg-orange-100 text-orange-800" },
    { id: "Web Development", name: "Web Dev", color: "bg-pink-100 text-pink-800" }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      live: { label: "Đang diễn ra", color: "bg-red-100 text-red-800", icon: "🔴" },
      upcoming: { label: "Sắp diễn ra", color: "bg-blue-100 text-blue-800", icon: "⏰" },
      completed: { label: "Đã kết thúc", color: "bg-gray-100 text-gray-800", icon: "✅" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    
    return (
      <Badge className={config.color}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  const filteredSessions = conferenceDays
    .find(day => day.id === selectedDay)
    ?.sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrack = selectedTrack === "all" || session.track === selectedTrack;
      return matchesSearch && matchesTrack;
    }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">
            Lịch trình hội nghị
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Khám phá các phiên họp, workshop và sự kiện networking trong hội nghị
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phiên họp, diễn giả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Days and Tracks */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Days */}
              <Card>
                <CardHeader>
                  <CardTitle>Ngày diễn ra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conferenceDays.map((day) => (
                      <Button
                        key={day.id}
                        variant={selectedDay === day.id ? "default" : "outline"}
                        onClick={() => setSelectedDay(day.id)}
                        className="w-full justify-start"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">{day.day}</div>
                          <div className="text-sm opacity-80">{day.date}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tracks */}
              <Card>
                <CardHeader>
                  <CardTitle>Chủ đề</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tracks.map((track) => (
                      <Button
                        key={track.id}
                        variant={selectedTrack === track.id ? "default" : "outline"}
                        onClick={() => setSelectedTrack(track.id)}
                        className="w-full justify-start"
                      >
                        <span className={`px-2 py-1 rounded text-xs mr-2 ${track.color}`}>
                          {track.name}
                        </span>
                        {track.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content - Sessions */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  Phiên họp ({filteredSessions.length})
                </CardTitle>
                <CardDescription>
                  {conferenceDays.find(day => day.id === selectedDay)?.day} - 
                  {conferenceDays.find(day => day.id === selectedDay)?.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredSessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusBadge(session.status)}
                              <Badge variant="outline">{session.track}</Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                              {session.title}
                            </h3>
                            <p className="text-slate-600 mb-4">{session.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{session.speaker}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <span>{session.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span>{session.room}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-slate-500" />
                              <span>{session.registered}/{session.capacity} người đăng ký</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(session.registered / session.capacity) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {session.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredSessions.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">
                        Không tìm thấy phiên họp nào
                      </h3>
                      <p className="text-slate-500">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
