"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Users,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  conference: string;
  registrationDate: string;
  status: "registered" | "checked-in" | "cancelled" | "no-show";
  dietary: string;
  specialNeeds: string;
  avatar?: string;
}

const mockAttendees: Attendee[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "0901234567",
    company: "Tech Corp",
    position: "Kỹ sư phần mềm",
    conference: "Hội nghị Công nghệ 2024",
    registrationDate: "2024-11-15",
    status: "checked-in",
    dietary: "Không",
    specialNeeds: "Không",
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "tran.thi.binh@email.com",
    phone: "0912345678",
    company: "AI Academy",
    position: "Giảng viên",
    conference: "Workshop AI & Machine Learning",
    registrationDate: "2024-11-18",
    status: "registered",
    dietary: "Chay",
    specialNeeds: "Xe lăn",
  },
  {
    id: "3",
    name: "Lê Văn Cường",
    email: "le.van.cuong@email.com",
    phone: "0923456789",
    company: "Startup Hub",
    position: "CEO",
    conference: "Seminar Khởi nghiệp",
    registrationDate: "2024-11-20",
    status: "registered",
    dietary: "Không",
    specialNeeds: "Không",
  },
  {
    id: "4",
    name: "Phạm Thị Dung",
    email: "pham.thi.dung@email.com",
    phone: "0934567890",
    company: "Medical Center",
    position: "Bác sĩ",
    conference: "Hội thảo Y tế",
    registrationDate: "2024-10-25",
    status: "no-show",
    dietary: "Không",
    specialNeeds: "Không",
  },
];

const statusColors = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "checked-in":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "no-show": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const statusLabels = {
  registered: "Đã đăng ký",
  "checked-in": "Đã check-in",
  cancelled: "Đã hủy",
  "no-show": "Vắng mặt",
};

export function AttendeeManagement() {
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conferenceFilter, setConferenceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAttendee, setNewAttendee] = useState<Partial<Attendee>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    conference: "Hội nghị Công nghệ 2024",
    registrationDate: new Date().toISOString().slice(0, 10),
    status: "registered",
    dietary: "",
    specialNeeds: "",
  });

  const conferences = [
    "Tất cả",
    "Hội nghị Công nghệ 2024",
    "Workshop AI & Machine Learning",
    "Seminar Khởi nghiệp",
    "Hội thảo Y tế",
  ];

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || attendee.status === statusFilter;
    const matchesConference =
      conferenceFilter === "all" || attendee.conference === conferenceFilter;
    return matchesSearch && matchesStatus && matchesConference;
  });

  const totalPages = Math.ceil(filteredAttendees.length / itemsPerPage);
  const paginatedAttendees = filteredAttendees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAddAttendee = () => {
    setAttendees([
      ...attendees,
      {
        ...newAttendee,
        id: (attendees.length + 1).toString(),
        status: "registered",
        registrationDate: new Date().toISOString().slice(0, 10),
      } as Attendee,
    ]);
    setIsDialogOpen(false);
    setNewAttendee({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      conference: "Hội nghị Công nghệ 2024",
      registrationDate: new Date().toISOString().slice(0, 10),
      status: "registered",
      dietary: "",
      specialNeeds: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">
            Quản lý người tham dự
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý danh sách người đăng ký
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người tham dự
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm người tham dự mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Họ tên"
                value={newAttendee.name}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={newAttendee.email}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, email: e.target.value })
                }
              />
              <Input
                placeholder="Số điện thoại"
                value={newAttendee.phone}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, phone: e.target.value })
                }
              />
              <Input
                placeholder="Công ty"
                value={newAttendee.company}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, company: e.target.value })
                }
              />
              <Input
                placeholder="Chức vụ"
                value={newAttendee.position}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, position: e.target.value })
                }
              />
              <Select
                value={newAttendee.conference}
                onValueChange={(val) =>
                  setNewAttendee({ ...newAttendee, conference: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hội nghị" />
                </SelectTrigger>
                <SelectContent>
                  {conferences.slice(1).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Nhu cầu ăn uống (ví dụ: Chay, Không)"
                value={newAttendee.dietary}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, dietary: e.target.value })
                }
              />
              <Input
                placeholder="Nhu cầu đặc biệt (nếu có)"
                value={newAttendee.specialNeeds}
                onChange={(e) =>
                  setNewAttendee({
                    ...newAttendee,
                    specialNeeds: e.target.value,
                  })
                }
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
              <Button
                onClick={handleAddAttendee}
                disabled={!newAttendee.name || !newAttendee.email}
              >
                Thêm mới
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đăng ký</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã check-in</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendees.filter((a) => a.status === "checked-in").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ check-in</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendees.filter((a) => a.status === "registered").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendees.filter((a) => a.status === "no-show").length}
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
                  placeholder="Tìm kiếm theo tên, email, công ty..."
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
                <SelectItem value="registered">Đã đăng ký</SelectItem>
                <SelectItem value="checked-in">Đã check-in</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="no-show">Vắng mặt</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={conferenceFilter}
              onValueChange={setConferenceFilter}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Hội nghị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hội nghị</SelectItem>
                <SelectItem value="Hội nghị Công nghệ 2024">
                  Hội nghị Công nghệ 2024
                </SelectItem>
                <SelectItem value="Workshop AI & Machine Learning">
                  Workshop AI & ML
                </SelectItem>
                <SelectItem value="Seminar Khởi nghiệp">
                  Seminar Khởi nghiệp
                </SelectItem>
                <SelectItem value="Hội thảo Y tế">Hội thảo Y tế</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Xuất danh sách
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người tham dự</CardTitle>
          <CardDescription>
            Hiển thị {paginatedAttendees.length} trong tổng số{" "}
            {filteredAttendees.length} người tham dự
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người tham dự</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Công ty</TableHead>
                  <TableHead>Hội nghị</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAttendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            src={attendee.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {getInitials(attendee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{attendee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {attendee.position}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attendee.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {attendee.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{attendee.company}</TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate">
                        {attendee.conference}
                      </div>
                    </TableCell>
                    <TableCell>{attendee.registrationDate}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[attendee.status]}>
                        {statusLabels[attendee.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          {attendee.status === "registered" && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Check-in thủ công
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
