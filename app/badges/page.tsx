"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  Award, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star,
  Trophy,
  Medal,
  Crown,
  Users,
  Download,
  Share2,
  Eye,
  CheckCircle,
  Clock
} from "lucide-react";

interface DigitalBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  points: number;
  category: 'attendance' | 'participation' | 'achievement' | 'special';
  isActive: boolean;
  earnedBy: number;
  conferenceId: number;
}

interface UserBadge {
  id: number;
  userId: number;
  userName: string;
  badgeId: number;
  badgeName: string;
  earnedAt: string;
  points: number;
  isVerified: boolean;
}

export default function BadgesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [badges, setBadges] = useState<DigitalBadge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockBadges: DigitalBadge[] = [
      {
        id: 1,
        name: "Tham dự viên tích cực",
        description: "Tham dự đầy đủ các phiên họp chính",
        icon: "star",
        color: "gold",
        criteria: "Tham dự ít nhất 80% các phiên họp",
        points: 100,
        category: "attendance",
        isActive: true,
        earnedBy: 25,
        conferenceId: currentConferenceId || 1
      },
      {
        id: 2,
        name: "Người tham gia tích cực",
        description: "Đặt câu hỏi và thảo luận trong phiên họp",
        icon: "trophy",
        color: "silver",
        criteria: "Đặt ít nhất 3 câu hỏi trong các phiên họp",
        points: 150,
        category: "participation",
        isActive: true,
        earnedBy: 12,
        conferenceId: currentConferenceId || 1
      },
      {
        id: 3,
        name: "Chuyên gia công nghệ",
        description: "Hoàn thành workshop về công nghệ mới",
        icon: "medal",
        color: "bronze",
        criteria: "Tham dự và hoàn thành ít nhất 2 workshop",
        points: 200,
        category: "achievement",
        isActive: true,
        earnedBy: 8,
        conferenceId: currentConferenceId || 1
      },
      {
        id: 4,
        name: "VIP Attendee",
        description: "Tham dự viên đặc biệt của hội nghị",
        icon: "crown",
        color: "platinum",
        criteria: "Được mời đặc biệt hoặc đóng góp lớn",
        points: 500,
        category: "special",
        isActive: true,
        earnedBy: 3,
        conferenceId: currentConferenceId || 1
      }
    ];

    const mockUserBadges: UserBadge[] = [
      {
        id: 1,
        userId: 1,
        userName: "Nguyễn Văn A",
        badgeId: 1,
        badgeName: "Tham dự viên tích cực",
        earnedAt: "2024-01-20 10:30:00",
        points: 100,
        isVerified: true
      },
      {
        id: 2,
        userId: 2,
        userName: "Trần Thị B",
        badgeId: 2,
        badgeName: "Người tham gia tích cực",
        earnedAt: "2024-01-20 11:15:00",
        points: 150,
        isVerified: true
      },
      {
        id: 3,
        userId: 3,
        userName: "Lê Văn C",
        badgeId: 3,
        badgeName: "Chuyên gia công nghệ",
        earnedAt: "2024-01-20 14:45:00",
        points: 200,
        isVerified: false
      }
    ];

    setTimeout(() => {
      setBadges(mockBadges);
      setUserBadges(mockUserBadges);
      setIsLoading(false);
    }, 1000);
  }, [currentConferenceId]);

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || badge.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getBadgeIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      "star": Star,
      "trophy": Trophy,
      "medal": Medal,
      "crown": Crown,
      "award": Award
    };
    return iconMap[iconName] || Award;
  };

  const getBadgeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      "gold": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "silver": "bg-gray-100 text-gray-800 border-gray-200",
      "bronze": "bg-orange-100 text-orange-800 border-orange-200",
      "platinum": "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colorMap[color] || "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      "attendance": "Tham dự",
      "participation": "Tham gia",
      "achievement": "Thành tích",
      "special": "Đặc biệt"
    };
    return categoryMap[category] || category;
  };

  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">        </div>
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
  const canView = hasConferencePermission("badges.view");

  if (!canView) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
              <CardDescription className="text-center">
                Bạn không có quyền xem huy hiệu số
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <ConferencePermissionGuard 
        requiredPermissions={["badges.view"]} 
        conferenceId={currentConferenceId ?? undefined}
      >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Huy hiệu số</h1>
              <p className="text-muted-foreground">
                Quản lý và trao huy hiệu kỹ thuật số cho tham dự viên
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo huy hiệu mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng huy hiệu</p>
                  <p className="text-2xl font-bold">{badges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Đã trao</p>
                  <p className="text-2xl font-bold">{userBadges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Đã xác minh</p>
                  <p className="text-2xl font-bold">
                    {userBadges.filter(ub => ub.isVerified).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Tổng điểm</p>
                  <p className="text-2xl font-bold">
                    {userBadges.reduce((sum, ub) => sum + ub.points, 0)}
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
                    placeholder="Tìm kiếm huy hiệu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="attendance">Tham dự</option>
                  <option value="participation">Tham gia</option>
                  <option value="achievement">Thành tích</option>
                  <option value="special">Đặc biệt</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const IconComponent = getBadgeIcon(badge.icon);
            return (
              <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${getBadgeColor(badge.color)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{badge.name}</CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Badge Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Điểm:</span>
                      <span className="font-medium">{badge.points}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Danh mục:</span>
                      <Badge variant="outline">{getCategoryLabel(badge.category)}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Đã trao:</span>
                      <span className="font-medium">{badge.earnedBy} người</span>
                    </div>
                  </div>

                  {/* Criteria */}
                  <div>
                    <p className="text-sm font-medium mb-1">Tiêu chí:</p>
                    <p className="text-sm text-muted-foreground">{badge.criteria}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Badge Awards */}
        <Card>
          <CardHeader>
            <CardTitle>Huy hiệu gần đây</CardTitle>
            <CardDescription>
              Danh sách huy hiệu được trao gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {userBadges.map((userBadge) => (
                  <div key={userBadge.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{userBadge.userName}</p>
                        <p className="text-sm text-muted-foreground">{userBadge.badgeName}</p>
                        <p className="text-xs text-muted-foreground">{userBadge.earnedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{userBadge.points} điểm</p>
                        <div className="flex items-center space-x-1">
                          {userBadge.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {userBadge.isVerified ? "Đã xác minh" : "Chờ xác minh"}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
          </ConferencePermissionGuard>
    </MainLayout>
  );
}