"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface CheckInRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  checkInTime: string;
  status: "checked-in" | "pending" | "late";
  event: string;
  location: string;
}

export function CheckInTable() {
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCheckInRecords = async () => {
      try {
        setLoading(true);

        // Mock data for now - replace with actual API call
        const mockRecords: CheckInRecord[] = [
          {
            id: "1",
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            company: "Công ty ABC",
            checkInTime: "2024-01-15T09:30:00Z",
            status: "checked-in",
            event: "Hội nghị Công nghệ 2024",
            location: "Phòng A101",
          },
          {
            id: "2",
            name: "Trần Thị B",
            email: "tranthib@example.com",
            company: "Công ty XYZ",
            checkInTime: "2024-01-15T09:45:00Z",
            status: "checked-in",
            event: "Hội nghị Công nghệ 2024",
            location: "Phòng A101",
          },
          {
            id: "3",
            name: "Lê Văn C",
            email: "levanc@example.com",
            company: "Công ty DEF",
            checkInTime: "",
            status: "pending",
            event: "Hội nghị Công nghệ 2024",
            location: "Phòng A101",
          },
          {
            id: "4",
            name: "Phạm Thị D",
            email: "phamthid@example.com",
            company: "Công ty GHI",
            checkInTime: "2024-01-15T10:15:00Z",
            status: "late",
            event: "Hội nghị Công nghệ 2024",
            location: "Phòng A101",
          },
        ];

        setRecords(mockRecords);
        setTotalPages(1);
      } catch (error) {
        console.error("Error fetching check-in records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckInRecords();
  }, [currentPage]);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked-in":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã check-in
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-orange-200 text-orange-800 dark:border-orange-800 dark:text-orange-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Chờ check-in
          </Badge>
        );
      case "late":
        return (
          <Badge variant="destructive">
            <Clock className="h-3 w-3 mr-1" />
            Trễ
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Chưa check-in";
    return new Date(timeString).toLocaleString("vi-VN");
  };

  const handleCheckIn = (recordId: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? {
              ...record,
              status: "checked-in" as const,
              checkInTime: new Date().toISOString(),
            }
          : record
      )
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bảng check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle>Bảng check-in</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="checked-in">Đã check-in</SelectItem>
              <SelectItem value="pending">Chờ check-in</SelectItem>
              <SelectItem value="late">Trễ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người tham dự</TableHead>
                <TableHead>Công ty</TableHead>
                <TableHead>Sự kiện</TableHead>
                <TableHead>Thời gian check-in</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{record.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{record.company}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {record.event}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {record.location}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatTime(record.checkInTime)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(record.id)}
                          className="h-8"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Check-in
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Không tìm thấy dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredRecords.length} kết quả
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
  );
}
