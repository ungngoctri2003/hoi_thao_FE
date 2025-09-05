"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Star,
  Heart,
  Share2,
  MoreVertical,
  QrCode,
  ExternalLink,
  Copy,
  Settings,
  Bell,
  Award,
  Trophy,
  Medal,
  Crown
} from "lucide-react";

interface Attendee {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  department: string;
  industry: string;
  registrationDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'registered' | 'checked-in' | 'cancelled' | 'no-show';
  conferenceId: number;
  avatar?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  interests: string[];
  skills: string[];
  experience: string;
  education: string;
  location: string;
  timezone: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  sessionsAttended: number[];
  sessionsBookmarked: number[];
  networkingConnections: number[];
  badges: number[];
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  isVIP: boolean;
  isSpeaker: boolean;
  isVolunteer: boolean;
  isSponsor: boolean;
  registrationType: 'early-bird' | 'regular' | 'student' | 'group' | 'vip';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  ticketNumber: string;
  qrCode: string;
  notes?: string;
  tags: string[];
  lastActive: string;
  totalAttendanceTime: number; // in minutes
  feedbackGiven: number;
  questionsAsked: number;
  networkingScore: number;
  engagementScore: number;
}

export default function AttendeesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('list');
  const [sortBy, setSortBy] = useState<string>("name");
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockAttendees: Attendee[] = [
      {
        id: 1,
        name: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phone: "0123456789",
        company: "TechCorp Vietnam",
        position: "CEO & Founder",
        department: "Executive",
        industry: "Technology",
        registrationDate: "2024-01-15",
        checkInTime: "2024-01-20 08:30:00",
        status: "checked-in",
        conferenceId: currentConferenceId || 1,
        avatar: "/avatars/attendee1.jpg",
        bio: "CEO với 15 năm kinh nghiệm trong lĩnh vực công nghệ, chuyên về AI và blockchain",
        website: "https://nguyenvana.com",
        linkedin: "nguyen-van-a",
        twitter: "@nguyenvana",
        interests: ["AI", "Blockchain", "Startup", "Innovation"],
        skills: ["Leadership", "Strategy", "AI", "Blockchain", "Business Development"],
        experience: "15+ years",
        education: "MBA, Computer Science",
        location: "Ho Chi Minh City, Vietnam",
        timezone: "Asia/Ho_Chi_Minh",
        dietaryRequirements: "Vegetarian",
        accessibilityNeeds: "Wheelchair accessible",
        emergencyContact: {
          name: "Nguyễn Thị A",
          phone: "0987654321",
          relationship: "Spouse"
        },
        sessionsAttended: [1, 2, 4],
        sessionsBookmarked: [1, 3],
        networkingConnections: [2, 3, 5],
        badges: [1, 2, 4],
        points: 450,
        level: "gold",
        isVIP: true,
        isSpeaker: true,
        isVolunteer: false,
        isSponsor: true,
        registrationType: "vip",
        paymentStatus: "paid",
        ticketNumber: "VIP001",
        qrCode: "QR_ATT_001",
        notes: "VIP attendee, keynote speaker",
        tags: ["VIP", "Speaker", "Sponsor", "Keynote"],
        lastActive: "2024-01-20 14:30:00",
        totalAttendanceTime: 180,
        feedbackGiven: 3,
        questionsAsked: 5,
        networkingScore: 8.5,
        engagementScore: 9.2
      },
      {
        id: 2,
        name: "Trần Thị B",
        email: "tranthib@email.com",
        phone: "0987654321",
        company: "AI Solutions Inc.",
        position: "AI Research Director",
        department: "Research & Development",
        industry: "Technology",
        registrationDate: "2024-01-16",
        checkInTime: "2024-01-20 09:15:00",
        status: "checked-in",
        conferenceId: currentConferenceId || 1,
        avatar: "/avatars/attendee2.jpg",
        bio: "Chuyên gia AI với 10 năm kinh nghiệm nghiên cứu và phát triển",
        website: "https://tranthib.ai",
        linkedin: "tran-thi-b",
        twitter: "@tranthib_ai",
        interests: ["AI", "Machine Learning", "Research", "Data Science"],
        skills: ["Python", "TensorFlow", "PyTorch", "Research", "Data Analysis"],
        experience: "10+ years",
        education: "PhD in Computer Science",
        location: "Hanoi, Vietnam",
        timezone: "Asia/Ho_Chi_Minh",
        dietaryRequirements: "None",
        accessibilityNeeds: "None",
        emergencyContact: {
          name: "Trần Văn B",
          phone: "0123456789",
          relationship: "Brother"
        },
        sessionsAttended: [1, 2],
        sessionsBookmarked: [2, 3],
        networkingConnections: [1, 3],
        badges: [1, 3],
        points: 320,
        level: "silver",
        isVIP: false,
        isSpeaker: true,
        isVolunteer: false,
        isSponsor: false,
        registrationType: "early-bird",
        paymentStatus: "paid",
        ticketNumber: "EB002",
        qrCode: "QR_ATT_002",
        notes: "AI expert, session speaker",
        tags: ["Speaker", "AI Expert", "Researcher"],
        lastActive: "2024-01-20 13:45:00",
        totalAttendanceTime: 120,
        feedbackGiven: 2,
        questionsAsked: 8,
        networkingScore: 7.8,
        engagementScore: 8.5
      },
      {
        id: 3,
        name: "Lê Văn C",
        email: "levanc@email.com",
        phone: "0369258147",
        company: "CryptoLab Vietnam",
        position: "Blockchain Architect",
        department: "Engineering",
        industry: "Technology",
        registrationDate: "2024-01-17",
        status: "registered",
        conferenceId: currentConferenceId || 1,
        avatar: "/avatars/attendee3.jpg",
        bio: "Blockchain architect với 8 năm kinh nghiệm phát triển DeFi applications",
        website: "https://levanc.crypto",
        linkedin: "le-van-c",
        twitter: "@levanc_crypto",
        interests: ["Blockchain", "DeFi", "Smart Contracts", "Web3"],
        skills: ["Solidity", "JavaScript", "Node.js", "Web3", "Smart Contracts"],
        experience: "8+ years",
        education: "MSc in Computer Science",
        location: "Da Nang, Vietnam",
        timezone: "Asia/Ho_Chi_Minh",
        dietaryRequirements: "Halal",
        accessibilityNeeds: "None",
        emergencyContact: {
          name: "Lê Thị C",
          phone: "0987654321",
          relationship: "Sister"
        },
        sessionsAttended: [],
        sessionsBookmarked: [3, 4],
        networkingConnections: [1, 2],
        badges: [2],
        points: 180,
        level: "bronze",
        isVIP: false,
        isSpeaker: true,
        isVolunteer: false,
        isSponsor: false,
        registrationType: "regular",
        paymentStatus: "paid",
        ticketNumber: "REG003",
        qrCode: "QR_ATT_003",
        notes: "Blockchain expert, workshop speaker",
        tags: ["Speaker", "Blockchain Expert", "Developer"],
        lastActive: "2024-01-20 10:20:00",
        totalAttendanceTime: 0,
        feedbackGiven: 0,
        questionsAsked: 0,
        networkingScore: 6.5,
        engagementScore: 7.2
      },
      {
        id: 4,
        name: "Phạm Thị D",
        email: "phamthid@email.com",
        phone: "0912345678",
        company: "Digital Marketing Agency",
        position: "Marketing Manager",
        department: "Marketing",
        industry: "Marketing",
        registrationDate: "2024-01-18",
        status: "cancelled",
        conferenceId: currentConferenceId || 1,
        avatar: "/avatars/attendee4.jpg",
        bio: "Marketing manager chuyên về digital marketing và social media",
        website: "https://phamthid.marketing",
        linkedin: "pham-thi-d",
        twitter: "@phamthid_mkt",
        interests: ["Digital Marketing", "Social Media", "Content Marketing", "SEO"],
        skills: ["Digital Marketing", "Social Media", "Content Creation", "Analytics"],
        experience: "6+ years",
        education: "Bachelor in Marketing",
        location: "Can Tho, Vietnam",
        timezone: "Asia/Ho_Chi_Minh",
        dietaryRequirements: "None",
        accessibilityNeeds: "None",
        emergencyContact: {
          name: "Phạm Văn D",
          phone: "0987654321",
          relationship: "Husband"
        },
        sessionsAttended: [],
        sessionsBookmarked: [1, 2],
        networkingConnections: [],
        badges: [],
        points: 0,
        level: "bronze",
        isVIP: false,
        isSpeaker: false,
        isVolunteer: false,
        isSponsor: false,
        registrationType: "regular",
        paymentStatus: "refunded",
        ticketNumber: "REG004",
        qrCode: "QR_ATT_004",
        notes: "Cancelled due to personal reasons",
        tags: ["Marketing", "Digital"],
        lastActive: "2024-01-18 16:30:00",
        totalAttendanceTime: 0,
        feedbackGiven: 0,
        questionsAsked: 0,
        networkingScore: 0,
        engagementScore: 0
      },
      {
        id: 5,
        name: "Hoàng Văn E",
        email: "hoangvane@email.com",
        phone: "0945678901",
        company: "StartupHub",
        position: "Product Manager",
        department: "Product",
        industry: "Technology",
        registrationDate: "2024-01-19",
        status: "no-show",
        conferenceId: currentConferenceId || 1,
        avatar: "/avatars/attendee5.jpg",
        bio: "Product manager với 5 năm kinh nghiệm trong startup ecosystem",
        website: "https://hoangvane.product",
        linkedin: "hoang-van-e",
        twitter: "@hoangvane_pm",
        interests: ["Product Management", "Startup", "UX/UI", "Agile"],
        skills: ["Product Management", "Agile", "Figma", "Analytics", "User Research"],
        experience: "5+ years",
        education: "Bachelor in Business Administration",
        location: "Bangkok, Thailand",
        timezone: "Asia/Bangkok",
        dietaryRequirements: "None",
        accessibilityNeeds: "None",
        emergencyContact: {
          name: "Hoàng Thị E",
          phone: "0987654321",
          relationship: "Wife"
        },
        sessionsAttended: [],
        sessionsBookmarked: [1, 2, 3],
        networkingConnections: [1],
        badges: [],
        points: 50,
        level: "bronze",
        isVIP: false,
        isSpeaker: false,
        isVolunteer: true,
        isSponsor: false,
        registrationType: "student",
        paymentStatus: "paid",
        ticketNumber: "STU005",
        qrCode: "QR_ATT_005",
        notes: "No-show, volunteer coordinator",
        tags: ["Volunteer", "Product Manager", "Startup"],
        lastActive: "2024-01-19 20:15:00",
        totalAttendanceTime: 0,
        feedbackGiven: 0,
        questionsAsked: 0,
        networkingScore: 3.2,
        engagementScore: 2.8
      }
    ];

    setTimeout(() => {
      setAttendees(mockAttendees);
      setIsLoading(false);
    }, 1000);
  }, [currentConferenceId]);

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.interests.some(interest => 
                           interest.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         attendee.skills.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = filterStatus === "all" || attendee.status === filterStatus;
    const matchesIndustry = filterIndustry === "all" || attendee.industry === filterIndustry;
    const matchesLevel = filterLevel === "all" || attendee.level === filterLevel;
    const matchesType = filterType === "all" || 
                       (filterType === "vip" && attendee.isVIP) ||
                       (filterType === "speaker" && attendee.isSpeaker) ||
                       (filterType === "volunteer" && attendee.isVolunteer) ||
                       (filterType === "sponsor" && attendee.isSponsor);
    return matchesSearch && matchesStatus && matchesIndustry && matchesLevel && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "company":
        return a.company.localeCompare(b.company);
      case "registrationDate":
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      case "points":
        return b.points - a.points;
      case "engagementScore":
        return b.engagementScore - a.engagementScore;
      case "networkingScore":
        return b.networkingScore - a.networkingScore;
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      registered: { label: "Đã đăng ký", color: "bg-blue-100 text-blue-800" },
      "checked-in": { label: "Đã check-in", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
      "no-show": { label: "Không tham dự", color: "bg-gray-100 text-gray-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      bronze: { label: "Đồng", color: "bg-orange-100 text-orange-800" },
      silver: { label: "Bạc", color: "bg-gray-100 text-gray-800" },
      gold: { label: "Vàng", color: "bg-yellow-100 text-yellow-800" },
      platinum: { label: "Bạch kim", color: "bg-purple-100 text-purple-800" }
    };
    
    const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.bronze;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getRegistrationTypeBadge = (type: string) => {
    const typeConfig = {
      "early-bird": { label: "Early Bird", color: "bg-green-100 text-green-800" },
      "regular": { label: "Thường", color: "bg-blue-100 text-blue-800" },
      "student": { label: "Sinh viên", color: "bg-purple-100 text-purple-800" },
      "group": { label: "Nhóm", color: "bg-orange-100 text-orange-800" },
      "vip": { label: "VIP", color: "bg-yellow-100 text-yellow-800" }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.regular;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-800" },
      pending: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
      refunded: { label: "Đã hoàn tiền", color: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  };

  const toggleAttendeeSelection = (attendeeId: number) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const selectAllAttendees = () => {
    setSelectedAttendees(filteredAttendees.map(a => a.id));
  };

  const clearSelection = () => {
    setSelectedAttendees([]);
  };

  const getEngagementColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getNetworkingColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const canManage = hasConferencePermission("attendees.manage");
  const canView = hasConferencePermission("attendees.view");

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

  if (!canView) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
              <CardDescription className="text-center">
                Bạn không có quyền xem danh sách tham dự
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
        requiredPermissions={["attendees.view"]} 
        conferenceId={currentConferenceId ?? undefined}
      >
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Quản lý tham dự viên</h1>
              <p className="text-muted-foreground">
                Quản lý và theo dõi thông tin chi tiết của người tham dự
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : viewMode === 'grid' ? 'cards' : 'list')}>
              {viewMode === 'list' && <Calendar className="h-4 w-4 mr-2" />}
              {viewMode === 'grid' && <Eye className="h-4 w-4 mr-2" />}
              {viewMode === 'cards' && <Users className="h-4 w-4 mr-2" />}
              {viewMode === 'list' ? 'Danh sách' : viewMode === 'grid' ? 'Lưới' : 'Thẻ'}
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            {canManage && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm tham dự viên
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng đăng ký</p>
                  <p className="text-2xl font-bold">{attendees.length}</p>
                  <p className="text-xs text-muted-foreground">+12% so với tuần trước</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Đã check-in</p>
                  <p className="text-2xl font-bold">
                    {attendees.filter(a => a.status === "checked-in").length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((attendees.filter(a => a.status === "checked-in").length / attendees.length) * 100)}% tỷ lệ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Chờ check-in</p>
                  <p className="text-2xl font-bold">
                    {attendees.filter(a => a.status === "registered").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Chưa tham dự</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Hủy/Không tham dự</p>
                  <p className="text-2xl font-bold">
                    {attendees.filter(a => a.status === "cancelled" || a.status === "no-show").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Tỷ lệ hủy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Bộ lọc nâng cao</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ngành nghề</label>
                  <select
                    value={filterIndustry}
                    onChange={(e) => setFilterIndustry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả ngành</option>
                    <option value="Technology">Công nghệ</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Tài chính</option>
                    <option value="Healthcare">Y tế</option>
                    <option value="Education">Giáo dục</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cấp độ</label>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả cấp độ</option>
                    <option value="bronze">Đồng</option>
                    <option value="silver">Bạc</option>
                    <option value="gold">Vàng</option>
                    <option value="platinum">Bạch kim</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Loại tham dự</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="vip">VIP</option>
                    <option value="speaker">Diễn giả</option>
                    <option value="volunteer">Tình nguyện viên</option>
                    <option value="sponsor">Nhà tài trợ</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sắp xếp theo</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="name">Tên</option>
                    <option value="company">Công ty</option>
                    <option value="registrationDate">Ngày đăng ký</option>
                    <option value="points">Điểm</option>
                    <option value="engagementScore">Điểm tương tác</option>
                    <option value="networkingScore">Điểm networking</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedAttendees.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    Đã chọn {selectedAttendees.length} tham dự viên
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Bỏ chọn tất cả
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-1" />
                    Gửi email
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Xuất danh sách
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Chỉnh sửa hàng loạt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, công ty, kỹ năng, sở thích..."
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
                  <option value="registered">Đã đăng ký</option>
                  <option value="checked-in">Đã check-in</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="no-show">Không tham dự</option>
                </select>
                <Button variant="outline" onClick={() => setShowBulkActions(!showBulkActions)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Hành động hàng loạt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees Display */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách tham dự viên ({filteredAttendees.length})</CardTitle>
                  <CardDescription>
                    Danh sách chi tiết tất cả người tham dự hội nghị
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllAttendees}>
                    Chọn tất cả
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                          onChange={selectedAttendees.length === filteredAttendees.length ? clearSelection : selectAllAttendees}
                        />
                      </TableHead>
                      <TableHead>Thông tin</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Công ty</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Điểm số</TableHead>
                      <TableHead>Hoạt động</TableHead>
                      {canManage && <TableHead>Hành động</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendees.map((attendee) => (
                      <TableRow key={attendee.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={selectedAttendees.includes(attendee.id)}
                            onChange={() => toggleAttendeeSelection(attendee.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              {attendee.avatar ? (
                                <img 
                                  src={attendee.avatar} 
                                  alt={attendee.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <Users className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{attendee.name}</p>
                              <p className="text-sm text-muted-foreground">{attendee.position}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                {getLevelBadge(attendee.level)}
                                {attendee.isVIP && <Badge className="bg-yellow-100 text-yellow-800 text-xs">VIP</Badge>}
                                {attendee.isSpeaker && <Badge className="bg-blue-100 text-blue-800 text-xs">Speaker</Badge>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{attendee.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{attendee.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{attendee.location}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{attendee.company}</p>
                            <p className="text-sm text-muted-foreground">{attendee.department}</p>
                            <p className="text-xs text-muted-foreground">{attendee.industry}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(attendee.status)}
                            {getRegistrationTypeBadge(attendee.registrationType)}
                            {getPaymentStatusBadge(attendee.paymentStatus)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Điểm:</span>
                              <span className="font-medium">{attendee.points}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Tương tác:</span>
                              <span className={`font-medium ${getEngagementColor(attendee.engagementScore)}`}>
                                {attendee.engagementScore.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Networking:</span>
                              <span className={`font-medium ${getNetworkingColor(attendee.networkingScore)}`}>
                                {attendee.networkingScore.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Phiên tham dự:</span>
                              <span>{attendee.sessionsAttended.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Thời gian:</span>
                              <span>{formatDuration(attendee.totalAttendanceTime)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Câu hỏi:</span>
                              <span>{attendee.questionsAsked}</span>
                            </div>
                          </div>
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" onClick={() => setSelectedAttendee(attendee)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAttendees.map((attendee) => (
              <Card key={attendee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {attendee.avatar ? (
                        <img 
                          src={attendee.avatar} 
                          alt={attendee.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{attendee.name}</CardTitle>
                      <CardDescription className="truncate">{attendee.position}</CardDescription>
                      <div className="flex items-center space-x-1 mt-1">
                        {getLevelBadge(attendee.level)}
                        {attendee.isVIP && <Badge className="bg-yellow-100 text-yellow-800 text-xs">VIP</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{attendee.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.company}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {getStatusBadge(attendee.status)}
                    <div className="flex items-center justify-between text-sm">
                      <span>Điểm:</span>
                      <span className="font-medium">{attendee.points}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Tương tác:</span>
                      <span className={`font-medium ${getEngagementColor(attendee.engagementScore)}`}>
                        {attendee.engagementScore.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {attendee.interests.slice(0, 3).map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {attendee.interests.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{attendee.interests.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedAttendee(attendee)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {canManage && (
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAttendees.map((attendee) => (
              <Card key={attendee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        {attendee.avatar ? (
                          <img 
                            src={attendee.avatar} 
                            alt={attendee.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{attendee.name}</CardTitle>
                        <CardDescription className="text-base">{attendee.position}</CardDescription>
                        <p className="text-sm text-muted-foreground">{attendee.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getStatusBadge(attendee.status)}
                      {getLevelBadge(attendee.level)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{attendee.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{attendee.registrationDate}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Sở thích:</p>
                    <div className="flex flex-wrap gap-1">
                      {attendee.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Kỹ năng:</p>
                    <div className="flex flex-wrap gap-1">
                      {attendee.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {attendee.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{attendee.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{attendee.points}</p>
                      <p className="text-xs text-muted-foreground">Điểm</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${getEngagementColor(attendee.engagementScore)}`}>
                        {attendee.engagementScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Tương tác</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${getNetworkingColor(attendee.networkingScore)}`}>
                        {attendee.networkingScore.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Networking</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => setSelectedAttendee(attendee)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Xem chi tiết
                    </Button>
                    {canManage && (
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
          </ConferencePermissionGuard>
    </MainLayout>
  );
}