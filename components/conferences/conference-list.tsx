"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Calendar, 
  Users, 
  MapPin,
  Building,
  Eye,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";

interface Conference {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  registered: number;
  status: "draft" | "published" | "active" | "completed" | "cancelled";
  category: string;
  organizer: string;
  createdAt: string;
}

const mockConferences: Conference[] = [
  {
    id: "1",
    name: "Hội nghị Công nghệ 2024",
    description: "Hội nghị về các xu hướng công nghệ mới nhất",
    startDate: "2024-12-15",
    endDate: "2024-12-16",
    location: "Trung tâm Hội nghị Quốc gia",
    capacity: 500,
    registered: 450,
    status: "active",
    category: "Công nghệ",
    organizer: "Tech Corp",
    createdAt: "2024-11-01",
  },
  {
    id: "2",
    name: "Workshop AI & Machine Learning",
    description: "Khóa học thực hành về AI và ML",
    startDate: "2024-12-18",
    endDate: "2024-12-18",
    location: "Phòng hội thảo A1",
    capacity: 120,
    registered: 115,
    status: "published",
    category: "Giáo dục",
    organizer: "AI Academy",
    createdAt: "2024-11-05",
  },
  {
    id: "3",
    name: "Seminar Khởi nghiệp",
    description: "Chia sẻ kinh nghiệm khởi nghiệp",
    startDate: "2024-12-22",
    endDate: "2024-12-22",
    location: "Khách sạn Metropole",
    capacity: 200,
    registered: 180,
    status: "published",
    category: "Kinh doanh",
    organizer: "Startup Hub",
    createdAt: "2024-11-10",
  },
  {
    id: "4",
    name: "Hội thảo Y tế",
    description: "Thảo luận về các vấn đề y tế hiện tại",
    startDate: "2024-11-20",
    endDate: "2024-11-20",
    location: "Bệnh viện Bạch Mai",
    capacity: 300,
    registered: 280,
    status: "completed",
    category: "Y tế",
    organizer: "Medical Center",
    createdAt: "2024-10-15",
  },
];

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  published: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  active: "Đang diễn ra",
  completed: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export function ConferenceList() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [conferences, setConferences] = useState<Conference[]>(mockConferences);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const itemsPerPage = 9;
  const categories = ["Tất cả", "Công nghệ", "Giáo dục", "Kinh doanh", "Y tế"];

  // Check permissions - staff and attendee can export
  const canExport = hasPermission("conferences.export");

  const filteredConferences = conferences.filter((conference) => {
    const matchesSearch =
      conference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || conference.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || conference.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredConferences.length / itemsPerPage);
  const paginatedConferences = filteredConferences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const csvContent = [
      ["Tên hội nghị", "Mô tả", "Ngày bắt đầu", "Ngày kết thúc", "Địa điểm", "Sức chứa", "Đã đăng ký", "Trạng thái", "Danh mục", "Người tổ chức"],
      ...filteredConferences.map(conference => [
        conference.name,
        conference.description,
        conference.startDate,
        conference.endDate,
        conference.location,
        conference.capacity.toString(),
        conference.registered.toString(),
        statusLabels[conference.status],
        conference.category,
        conference.organizer
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `conferences_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Danh sách hội nghị</h1>
          <p className="text-muted-foreground">Xem và tìm kiếm các hội nghị có sẵn</p>
        </div>
        <div className="flex space-x-2">
          {canExport && (
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 'Danh sách' : 'Lưới'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hội nghị</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conferences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conferences.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người đăng ký</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conferences.reduce((sum, c) => sum + c.registered, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (conferences.reduce((sum, c) => sum + c.registered, 0) /
                  conferences.reduce((sum, c) => sum + c.capacity, 0)) *
                  100,
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm hội nghị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="active">Đang diễn ra</SelectItem>
                <SelectItem value="completed">Đã kết thúc</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="Công nghệ">Công nghệ</SelectItem>
                <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                <SelectItem value="Y tế">Y tế</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conference Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedConferences.map((conference) => (
            <Card key={conference.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-2">{conference.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{conference.description}</CardDescription>
                  </div>
                  <Badge className={statusColors[conference.status]}>
                    {statusLabels[conference.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(conference.startDate)} - {formatDate(conference.endDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{conference.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{conference.registered}/{conference.capacity} người tham dự</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Danh mục:</span>
                    <Badge variant="outline">{conference.category}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tổ chức bởi:</span>
                    <span className="font-medium">{conference.organizer}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((conference.registered / conference.capacity) * 100, 100)}%`,
                    }}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conference List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách hội nghị</CardTitle>
            <CardDescription>
              Hiển thị {paginatedConferences.length} trong tổng số {filteredConferences.length} hội nghị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên hội nghị</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Sức chứa</TableHead>
                    <TableHead>Đã đăng ký</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedConferences.map((conference) => (
                    <TableRow key={conference.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{conference.name}</div>
                          <div className="text-sm text-muted-foreground">{conference.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatDate(conference.startDate)}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(conference.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{conference.location}</TableCell>
                      <TableCell>{conference.capacity}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{conference.registered}</span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min((conference.registered / conference.capacity) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[conference.status]}>
                          {statusLabels[conference.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{conference.category}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Trang {currentPage} trong {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
