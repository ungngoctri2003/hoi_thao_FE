"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Download, Calendar, Users, MapPin } from "lucide-react"
import { ConferenceDialog } from "./conference-dialog"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"

interface Conference {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
  registered: number
  status: "draft" | "published" | "active" | "completed" | "cancelled"
  category: string
  organizer: string
  createdAt: string
}

const mockConferences: Conference[] = [
  {
    id: "1",
    name: "Hội nghị Công nghệ 2024",
    description: "Hội nghị về các xu hướng công nghệ mới nhất",
    date: "2024-12-15",
    time: "08:00 - 17:00",
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
    date: "2024-12-18",
    time: "09:00 - 12:00",
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
    date: "2024-12-22",
    time: "14:00 - 16:00",
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
    date: "2024-11-20",
    time: "08:30 - 16:30",
    location: "Bệnh viện Bạch Mai",
    capacity: 300,
    registered: 280,
    status: "completed",
    category: "Y tế",
    organizer: "Medical Center",
    createdAt: "2024-10-15",
  },
]

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  published: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const statusLabels = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  active: "Đang diễn ra",
  completed: "Đã kết thúc",
  cancelled: "Đã hủy",
}

export function ConferenceManagement() {
  const [conferences, setConferences] = useState<Conference[]>(mockConferences)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConference, setEditingConference] = useState<Conference | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [conferenceToDelete, setConferenceToDelete] = useState<Conference | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const categories = ["Tất cả", "Công nghệ", "Giáo dục", "Kinh doanh", "Y tế"]

  const filteredConferences = conferences.filter((conference) => {
    const matchesSearch =
      conference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || conference.status === statusFilter
    const matchesCategory = categoryFilter === "all" || conference.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalPages = Math.ceil(filteredConferences.length / itemsPerPage)
  const paginatedConferences = filteredConferences.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleCreateConference = () => {
    setEditingConference(null)
    setIsDialogOpen(true)
  }

  const handleEditConference = (conference: Conference) => {
    setEditingConference(conference)
    setIsDialogOpen(true)
  }

  const handleDeleteConference = (conference: Conference) => {
    setConferenceToDelete(conference)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (conferenceToDelete) {
      setConferences(conferences.filter((c) => c.id !== conferenceToDelete.id))
      setConferenceToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  const handleSaveConference = (conferenceData: Partial<Conference>) => {
    if (editingConference) {
      // Update existing conference
      setConferences(conferences.map((c) => (c.id === editingConference.id ? { ...c, ...conferenceData } : c)))
    } else {
      // Create new conference
      const newConference: Conference = {
        id: Date.now().toString(),
        name: conferenceData.name || "",
        description: conferenceData.description || "",
        date: conferenceData.date || "",
        time: conferenceData.time || "",
        location: conferenceData.location || "",
        capacity: conferenceData.capacity || 0,
        registered: 0,
        status: "draft",
        category: conferenceData.category || "",
        organizer: conferenceData.organizer || "",
        createdAt: new Date().toISOString().split("T")[0],
      }
      setConferences([...conferences, newConference])
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Quản lý hội nghị</h1>
          <p className="text-muted-foreground">Tạo và quản lý các sự kiện hội nghị</p>
        </div>
        <Button onClick={handleCreateConference}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo hội nghị mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hội nghị</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold">{conferences.filter((c) => c.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người đăng ký</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conferences.reduce((sum, c) => sum + c.registered, 0)}</div>
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
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conference Table */}
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
                        <div className="font-medium">{conference.date}</div>
                        <div className="text-sm text-muted-foreground">{conference.time}</div>
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
                      <Badge className={statusColors[conference.status]}>{statusLabels[conference.status]}</Badge>
                    </TableCell>
                    <TableCell>{conference.category}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditConference(conference)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteConference(conference)} className="text-red-600">
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

      {/* Dialogs */}
      <ConferenceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        conference={editingConference}
        onSave={handleSaveConference}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        itemName={conferenceToDelete?.name || ""}
      />
    </div>
  )
}
