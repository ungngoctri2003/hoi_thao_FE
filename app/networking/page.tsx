"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Network, 
  Search, 
  MessageCircle, 
  UserPlus, 
  Users, 
  MapPin,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  Star,
  Heart,
  Share2,
  Clock
} from "lucide-react";

interface NetworkingContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  interests: string[];
  mutualConnections: number;
  lastInteraction: string;
  status: 'connected' | 'pending' | 'suggested';
  avatar?: string;
  conferenceId: number;
}

export default function NetworkingPage() {
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [contacts, setContacts] = useState<NetworkingContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockContacts: NetworkingContact[] = [
      {
        id: 1,
        name: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phone: "0123456789",
        company: "Công ty ABC",
        position: "Giám đốc",
        interests: ["AI", "Blockchain", "Startup"],
        mutualConnections: 5,
        lastInteraction: "2024-01-20",
        status: "connected",
        conferenceId: currentConferenceId || 1
      },
      {
        id: 2,
        name: "Trần Thị B",
        email: "tranthib@email.com",
        phone: "0987654321",
        company: "Công ty XYZ",
        position: "Nhân viên",
        interests: ["Marketing", "Digital", "E-commerce"],
        mutualConnections: 2,
        lastInteraction: "2024-01-19",
        status: "pending",
        conferenceId: currentConferenceId || 1
      },
      {
        id: 3,
        name: "Lê Văn C",
        email: "levanc@email.com",
        phone: "0369258147",
        company: "Công ty DEF",
        position: "Trưởng phòng",
        interests: ["Technology", "Innovation", "Leadership"],
        mutualConnections: 8,
        lastInteraction: "2024-01-18",
        status: "suggested",
        conferenceId: currentConferenceId || 1
      }
    ];

    setTimeout(() => {
      setContacts(mockContacts);
      setIsLoading(false);
    }, 1000);
  }, [currentConferenceId]);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.interests.some(interest => 
                           interest.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { label: "Đã kết nối", color: "bg-green-100 text-green-800" },
      pending: { label: "Chờ phản hồi", color: "bg-yellow-100 text-yellow-800" },
      suggested: { label: "Gợi ý", color: "bg-blue-100 text-blue-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.suggested;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const canView = hasConferencePermission("networking.view");

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
            <CardDescription className="text-center">
              Bạn không có quyền truy cập tính năng kết nối mạng
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ConferencePermissionGuard 
      requiredPermissions={["networking.view"]} 
      conferenceId={currentConferenceId ?? undefined}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Network className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Kết nối mạng</h1>
              <p className="text-muted-foreground">
                Kết nối và giao lưu với người tham dự hội nghị
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ hồ sơ
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tìm kết nối mới
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
                  <p className="text-sm font-medium">Tổng kết nối</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Đã kết nối</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.status === "connected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Chờ phản hồi</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Gợi ý kết nối</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter(c => c.status === "suggested").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, công ty, sở thích..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="connected">Đã kết nối</option>
                  <option value="pending">Chờ phản hồi</option>
                  <option value="suggested">Gợi ý</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Networking Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <CardDescription>{contact.position} tại {contact.company}</CardDescription>
                    {getStatusBadge(contact.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.company}</span>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <p className="text-sm font-medium mb-2">Sở thích:</p>
                  <div className="flex flex-wrap gap-1">
                    {contact.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mutual Connections */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {contact.mutualConnections} kết nối chung
                  </span>
                  <span className="text-muted-foreground">
                    {contact.lastInteraction}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  {contact.status === "suggested" && (
                    <Button size="sm" className="flex-1">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Kết nối
                    </Button>
                  )}
                  {contact.status === "connected" && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Nhắn tin
                    </Button>
                  )}
                  {contact.status === "pending" && (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      <Clock className="h-4 w-4 mr-1" />
                      Chờ phản hồi
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Networking Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Mẹo kết nối mạng hiệu quả</CardTitle>
            <CardDescription>
              Cách tối ưu hóa trải nghiệm networking tại hội nghị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Trước hội nghị</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cập nhật hồ sơ cá nhân đầy đủ</li>
                  <li>• Xem danh sách tham dự viên</li>
                  <li>• Chuẩn bị câu hỏi và chủ đề thảo luận</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Trong hội nghị</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tham gia các phiên thảo luận</li>
                  <li>• Tích cực đặt câu hỏi</li>
                  <li>• Chia sẻ thông tin liên hệ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConferencePermissionGuard>
  );
}