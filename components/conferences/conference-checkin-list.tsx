"use client";

import { useState, useEffect } from "react";
import { ConferenceCheckinCard } from "./conference-checkin-card";
import { CheckinSuccessModal } from "@/components/ui/checkin-success-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Calendar,
  Users,
  QrCode,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Conference {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "active" | "upcoming" | "completed";
  maxAttendees: number;
  currentAttendees: number;
  image: string;
  organizer: string;
  category: string;
  checkinRequired: boolean;
  qrCode: string;
}

interface ConferenceCheckinListProps {
  onCheckin?: (conferenceId: number) => void;
}

export function ConferenceCheckinList({
  onCheckin,
}: ConferenceCheckinListProps) {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [filteredConferences, setFilteredConferences] = useState<Conference[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkedInConference, setCheckedInConference] =
    useState<Conference | null>(null);

  const categories = ["Technology", "Business", "Healthcare", "Education"];
  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang diễn ra" },
    { value: "upcoming", label: "Sắp diễn ra" },
    { value: "completed", label: "Đã kết thúc" },
  ];

  const fetchConferences = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchTerm) params.append("search", searchTerm);

      const url = `/api/conferences/public?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setConferences(data.data);
        setFilteredConferences(data.data);
      } else {
        setError(data.error || "Không thể tải danh sách hội nghị");
      }
    } catch (err) {
      console.error("Error fetching conferences:", err);
      setError("Lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    const filtered = conferences.filter(
      (conference) =>
        conference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conference.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        conference.organizer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConferences(filtered);
  }, [searchTerm, conferences]);

  const handleCheckin = (conferenceId: number) => {
    const conference = conferences.find((c) => c.id === conferenceId);
    if (conference) {
      setCheckedInConference(conference);
      setShowSuccessModal(true);
    }
    onCheckin?.(conferenceId);
    // Refresh the list to update attendance numbers
    fetchConferences();
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setCheckedInConference(null);
  };

  const getStats = () => {
    const active = conferences.filter((c) => c.status === "active").length;
    const upcoming = conferences.filter((c) => c.status === "upcoming").length;
    const completed = conferences.filter(
      (c) => c.status === "completed"
    ).length;
    const totalAttendees = conferences.reduce(
      (sum, c) => sum + c.currentAttendees,
      0
    );

    return { active, upcoming, completed, totalAttendees };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-slate-600 dark:text-slate-300">
              Đang tải danh sách hội nghị...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Không thể tải danh sách hội nghị
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <Button
                onClick={fetchConferences}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Modal */}
      {checkedInConference && (
        <CheckinSuccessModal
          isOpen={showSuccessModal}
          onClose={closeSuccessModal}
          conferenceName={checkedInConference.name}
          conferenceLocation={checkedInConference.location}
          conferenceDate={new Date(
            checkedInConference.startDate
          ).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      )}

      {/* Header with Stats */}
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-slate-700/20">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Check-in Hội nghị
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Chọn hội nghị bạn muốn tham dự và thực hiện check-in nhanh chóng
              với QR Code
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.active}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Đang diễn ra
            </div>
          </CardContent>
        </Card>

        <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.upcoming}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Sắp diễn ra
            </div>
          </CardContent>
        </Card>

        <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.completed}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Đã kết thúc
            </div>
          </CardContent>
        </Card>

        <Card className="text-center group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.totalAttendees}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Người tham dự
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm hội nghị, tổ chức..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-slate-200 dark:border-slate-600">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-slate-200 dark:border-slate-600">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={fetchConferences}
                variant="outline"
                className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conferences List */}
      {filteredConferences.length === 0 ? (
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Không tìm thấy hội nghị
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm hội nghị phù hợp"
                  : "Hiện tại chưa có hội nghị nào. Vui lòng quay lại sau."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredConferences.map((conference) => (
            <ConferenceCheckinCard
              key={conference.id}
              conference={conference}
              onCheckin={handleCheckin}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredConferences.length > 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Hiển thị {filteredConferences.length} hội nghị
          {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") &&
            ` trong ${conferences.length} hội nghị tổng cộng`}
        </div>
      )}
    </div>
  );
}
