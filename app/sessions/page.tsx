"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
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
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  Video, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Clock,
  Users,
  MapPin,
  Calendar,
  Mic,
  Camera,
  Share2,
  MessageCircle,
  Download,
  Filter,
  Settings,
  Star,
  Heart,
  Bookmark,
  Eye,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  QrCode,
  Headphones,
  Wifi,
  Battery,
  Signal,
  Network
} from "lucide-react";

interface Session {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  room: string;
  speaker: string;
  speakerTitle: string;
  speakerCompany: string;
  speakerAvatar?: string;
  status: 'upcoming' | 'live' | 'ended';
  attendees: number;
  maxAttendees: number;
  conferenceId: number;
  isRecorded: boolean;
  hasQnA: boolean;
  hasLiveStream: boolean;
  hasRecording: boolean;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration: number; // in minutes
  slidesUrl?: string;
  resourcesUrl?: string;
  feedbackScore: number;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  isBookmarked: boolean;
  isLiked: boolean;
  streamUrl?: string;
  recordingUrl?: string;
  qrCode: string;
  sessionType: 'keynote' | 'presentation' | 'workshop' | 'panel' | 'networking';
  requirements: string[];
  learningOutcomes: string[];
  prerequisites: string[];
  materials: string[];
  networkingOpportunities: string[];
  relatedSessions: number[];
  socialMedia: {
    twitter: string;
    linkedin: string;
    hashtags: string[];
  };
  technicalRequirements: {
    internetSpeed: string;
    device: string[];
    software: string[];
  };
  accessibility: {
    closedCaptions: boolean;
    signLanguage: boolean;
    audioDescription: boolean;
    transcript: boolean;
  };
  timezone: string;
  localStartTime: string;
  localEndTime: string;
}

export default function SessionsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<string>("startTime");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSessions: Session[] = [
      {
        id: 1,
        title: "Khai mạc hội nghị: Tương lai của Công nghệ",
        description: "Phát biểu khai mạc và giới thiệu chương trình hội nghị với những xu hướng công nghệ mới nhất",
        startTime: "2024-01-20 09:00:00",
        endTime: "2024-01-20 09:30:00",
        localStartTime: "09:00",
        localEndTime: "09:30",
        room: "Phòng A101 - Hội trường chính",
        speaker: "Nguyễn Văn A",
        speakerTitle: "CEO & Founder",
        speakerCompany: "TechCorp Vietnam",
        speakerAvatar: "/avatars/speaker1.jpg",
        status: "live",
        attendees: 45,
        maxAttendees: 50,
        conferenceId: currentConferenceId || 1,
        isRecorded: true,
        hasQnA: true,
        hasLiveStream: true,
        hasRecording: false,
        category: "Keynote",
        tags: ["AI", "Technology", "Innovation", "Future"],
        difficulty: "beginner",
        language: "Tiếng Việt",
        duration: 30,
        slidesUrl: "https://slides.com/session1",
        resourcesUrl: "https://resources.com/session1",
        feedbackScore: 4.8,
        viewCount: 1250,
        likeCount: 89,
        bookmarkCount: 45,
        isBookmarked: false,
        isLiked: false,
        streamUrl: "https://stream.com/session1",
        qrCode: "QR001",
        sessionType: "keynote",
        requirements: ["Không yêu cầu kiến thức trước"],
        learningOutcomes: [
          "Hiểu được xu hướng công nghệ hiện tại",
          "Nắm bắt cơ hội trong tương lai",
          "Kết nối với cộng đồng tech"
        ],
        prerequisites: [],
        materials: ["Slide presentation", "Resource links"],
        networkingOpportunities: ["Coffee break", "Networking session"],
        relatedSessions: [2, 3],
        socialMedia: {
          twitter: "@techconference",
          linkedin: "tech-conference-2024",
          hashtags: ["#TechConf2024", "#AI", "#Innovation"]
        },
        technicalRequirements: {
          internetSpeed: "5 Mbps",
          device: ["Laptop", "Tablet", "Smartphone"],
          software: ["Web browser", "Zoom client"]
        },
        accessibility: {
          closedCaptions: true,
          signLanguage: false,
          audioDescription: false,
          transcript: true
        },
        timezone: "Asia/Ho_Chi_Minh"
      },
      {
        id: 2,
        title: "Xu hướng AI trong doanh nghiệp: Từ Lý thuyết đến Thực tiễn",
        description: "Thảo luận sâu về ứng dụng AI trong các lĩnh vực kinh doanh, case studies thực tế và roadmap triển khai",
        startTime: "2024-01-20 10:00:00",
        endTime: "2024-01-20 11:30:00",
        localStartTime: "10:00",
        localEndTime: "11:30",
        room: "Phòng B201 - Conference Room",
        speaker: "Trần Thị B",
        speakerTitle: "AI Research Director",
        speakerCompany: "AI Solutions Inc.",
        speakerAvatar: "/avatars/speaker2.jpg",
        status: "upcoming",
        attendees: 0,
        maxAttendees: 100,
        conferenceId: currentConferenceId || 1,
        isRecorded: true,
        hasQnA: true,
        hasLiveStream: true,
        hasRecording: false,
        category: "Technology",
        tags: ["AI", "Machine Learning", "Business", "Case Study"],
        difficulty: "intermediate",
        language: "Tiếng Việt",
        duration: 90,
        slidesUrl: "https://slides.com/session2",
        resourcesUrl: "https://resources.com/session2",
        feedbackScore: 0,
        viewCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        isBookmarked: false,
        isLiked: false,
        qrCode: "QR002",
        sessionType: "presentation",
        requirements: ["Kiến thức cơ bản về AI/ML", "Laptop để thực hành"],
        learningOutcomes: [
          "Hiểu cách triển khai AI trong doanh nghiệp",
          "Học từ case studies thực tế",
          "Xây dựng roadmap AI cho công ty"
        ],
        prerequisites: ["AI Fundamentals", "Business Analysis"],
        materials: ["Code examples", "Dataset samples", "Implementation guides"],
        networkingOpportunities: ["Q&A session", "Expert consultation"],
        relatedSessions: [1, 4],
        socialMedia: {
          twitter: "@aiworkshop",
          linkedin: "ai-business-2024",
          hashtags: ["#AIBusiness", "#MachineLearning", "#TechConf2024"]
        },
        technicalRequirements: {
          internetSpeed: "10 Mbps",
          device: ["Laptop", "Development environment"],
          software: ["Python", "Jupyter Notebook", "TensorFlow"]
        },
        accessibility: {
          closedCaptions: true,
          signLanguage: false,
          audioDescription: false,
          transcript: true
        },
        timezone: "Asia/Ho_Chi_Minh"
      },
      {
        id: 3,
        title: "Workshop: Xây dựng Ứng dụng Blockchain từ A-Z",
        description: "Hướng dẫn thực hành chi tiết về công nghệ blockchain, smart contracts và DeFi applications",
        startTime: "2024-01-20 14:00:00",
        endTime: "2024-01-20 16:00:00",
        localStartTime: "14:00",
        localEndTime: "16:00",
        room: "Phòng A102 - Workshop Room",
        speaker: "Lê Văn C",
        speakerTitle: "Blockchain Architect",
        speakerCompany: "CryptoLab Vietnam",
        speakerAvatar: "/avatars/speaker3.jpg",
        status: "upcoming",
        attendees: 0,
        maxAttendees: 30,
        conferenceId: currentConferenceId || 1,
        isRecorded: false,
        hasQnA: false,
        hasLiveStream: false,
        hasRecording: false,
        category: "Workshop",
        tags: ["Blockchain", "Smart Contracts", "DeFi", "Hands-on"],
        difficulty: "advanced",
        language: "Tiếng Việt",
        duration: 120,
        slidesUrl: "https://slides.com/session3",
        resourcesUrl: "https://resources.com/session3",
        feedbackScore: 0,
        viewCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        isBookmarked: false,
        isLiked: false,
        qrCode: "QR003",
        sessionType: "workshop",
        requirements: ["Laptop", "Node.js installed", "Git", "Basic programming knowledge"],
        learningOutcomes: [
          "Xây dựng smart contract đầu tiên",
          "Hiểu về DeFi protocols",
          "Deploy ứng dụng blockchain"
        ],
        prerequisites: ["JavaScript", "Web3 basics", "Cryptocurrency knowledge"],
        materials: ["Code templates", "Test networks", "Development tools"],
        networkingOpportunities: ["Code review session", "Project showcase"],
        relatedSessions: [2, 5],
        socialMedia: {
          twitter: "@blockchainworkshop",
          linkedin: "blockchain-dev-2024",
          hashtags: ["#Blockchain", "#DeFi", "#SmartContracts", "#TechConf2024"]
        },
        technicalRequirements: {
          internetSpeed: "15 Mbps",
          device: ["Laptop", "High-performance"],
          software: ["Node.js", "Truffle", "Ganache", "MetaMask"]
        },
        accessibility: {
          closedCaptions: false,
          signLanguage: false,
          audioDescription: false,
          transcript: false
        },
        timezone: "Asia/Ho_Chi_Minh"
      },
      {
        id: 4,
        title: "Panel Discussion: Tương lai của Web3 và Metaverse",
        description: "Thảo luận với các chuyên gia về tương lai của Web3, Metaverse và tác động đến cuộc sống",
        startTime: "2024-01-19 17:00:00",
        endTime: "2024-01-19 17:30:00",
        localStartTime: "17:00",
        localEndTime: "17:30",
        room: "Phòng A101 - Hội trường chính",
        speaker: "Nguyễn Văn A",
        speakerTitle: "Moderator",
        speakerCompany: "TechCorp Vietnam",
        speakerAvatar: "/avatars/speaker1.jpg",
        status: "ended",
        attendees: 40,
        maxAttendees: 50,
        conferenceId: currentConferenceId || 1,
        isRecorded: true,
        hasQnA: false,
        hasLiveStream: false,
        hasRecording: true,
        recordingUrl: "https://recordings.com/session4",
        category: "Panel",
        tags: ["Web3", "Metaverse", "Discussion", "Future"],
        difficulty: "intermediate",
        language: "Tiếng Việt",
        duration: 30,
        slidesUrl: "https://slides.com/session4",
        resourcesUrl: "https://resources.com/session4",
        feedbackScore: 4.5,
        viewCount: 890,
        likeCount: 67,
        bookmarkCount: 23,
        isBookmarked: false,
        isLiked: false,
        qrCode: "QR004",
        sessionType: "panel",
        requirements: ["Không yêu cầu kiến thức chuyên sâu"],
        learningOutcomes: [
          "Hiểu về Web3 và Metaverse",
          "Tầm nhìn tương lai của công nghệ",
          "Cơ hội đầu tư và phát triển"
        ],
        prerequisites: [],
        materials: ["Discussion notes", "Resource links"],
        networkingOpportunities: ["Panel Q&A", "Expert networking"],
        relatedSessions: [1, 2],
        socialMedia: {
          twitter: "@web3panel",
          linkedin: "web3-metaverse-2024",
          hashtags: ["#Web3", "#Metaverse", "#TechConf2024"]
        },
        technicalRequirements: {
          internetSpeed: "5 Mbps",
          device: ["Any device"],
          software: ["Web browser"]
        },
        accessibility: {
          closedCaptions: true,
          signLanguage: false,
          audioDescription: false,
          transcript: true
        },
        timezone: "Asia/Ho_Chi_Minh"
      }
    ];

    setTimeout(() => {
      setSessions(mockSessions);
      setIsLoading(false);
    }, 1000);
  }, [currentConferenceId]);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || session.status === filterStatus;
    const matchesCategory = filterCategory === "all" || session.category === filterCategory;
    const matchesDifficulty = filterDifficulty === "all" || session.difficulty === filterDifficulty;
    const matchesType = filterType === "all" || session.sessionType === filterType;
    return matchesSearch && matchesStatus && matchesCategory && matchesDifficulty && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case "startTime":
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "speaker":
        return a.speaker.localeCompare(b.speaker);
      case "duration":
        return a.duration - b.duration;
      case "feedbackScore":
        return b.feedbackScore - a.feedbackScore;
      case "viewCount":
        return b.viewCount - a.viewCount;
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: "Sắp diễn ra", color: "bg-blue-100 text-blue-800", icon: Clock },
      live: { label: "Đang phát trực tiếp", color: "bg-red-100 text-red-800", icon: Play },
      ended: { label: "Đã kết thúc", color: "bg-gray-100 text-gray-800", icon: Pause }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      beginner: { label: "Cơ bản", color: "bg-green-100 text-green-800" },
      intermediate: { label: "Trung bình", color: "bg-yellow-100 text-yellow-800" },
      advanced: { label: "Nâng cao", color: "bg-red-100 text-red-800" }
    };
    
    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.beginner;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getSessionTypeIcon = (type: string) => {
    const typeConfig = {
      keynote: Video,
      presentation: Mic,
      workshop: Settings,
      panel: Users,
      networking: Network
    };
    
    return typeConfig[type as keyof typeof typeConfig] || Video;
  };

  const getSessionTypeLabel = (type: string) => {
    const typeConfig = {
      keynote: "Keynote",
      presentation: "Thuyết trình",
      workshop: "Workshop",
      panel: "Panel",
      networking: "Networking"
    };
    
    return typeConfig[type as keyof typeof typeConfig] || type;
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

  const toggleBookmark = (sessionId: number) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, isBookmarked: !session.isBookmarked }
        : session
    ));
  };

  const toggleLike = (sessionId: number) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            isLiked: !session.isLiked,
            likeCount: session.isLiked ? session.likeCount - 1 : session.likeCount + 1
          }
        : session
    ));
  };

  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <MainLayout userRole="attendee" userName="Loading" userAvatar="">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <MainLayout userRole="attendee" userName="Guest" userAvatar="">
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
      </MainLayout>
    );
  }

  // Get user info for MainLayout
  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;
  const canView = hasConferencePermission("sessions.view");

  if (!canView) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
              <CardDescription className="text-center">
                Bạn không có quyền xem các phiên họp
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
        requiredPermissions={["sessions.view"]} 
        conferenceId={currentConferenceId ?? undefined}
      >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Video className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Phiên họp & Thuyết trình</h1>
              <p className="text-muted-foreground">
                Quản lý và theo dõi các phiên họp, workshop và thuyết trình
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : viewMode === 'list' ? 'timeline' : 'grid')}>
              {viewMode === 'grid' && <Eye className="h-4 w-4 mr-2" />}
              {viewMode === 'list' && <Calendar className="h-4 w-4 mr-2" />}
              {viewMode === 'timeline' && <Clock className="h-4 w-4 mr-2" />}
              {viewMode === 'grid' ? 'Lưới' : viewMode === 'list' ? 'Danh sách' : 'Thời gian'}
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo phiên mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng phiên</p>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                  <p className="text-xs text-muted-foreground">+2 so với tuần trước</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Đang phát</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(s => s.status === "live").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Trực tiếp</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Sắp diễn ra</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(s => s.status === "upcoming").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Trong ngày</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Tổng tham dự</p>
                  <p className="text-2xl font-bold">
                    {sessions.reduce((sum, s) => sum + s.attendees, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Người tham dự</p>
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
                  <label className="text-sm font-medium mb-2 block">Danh mục</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="Keynote">Keynote</option>
                    <option value="Technology">Công nghệ</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Panel">Panel</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Độ khó</label>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả độ khó</option>
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung bình</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Loại phiên</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="keynote">Keynote</option>
                    <option value="presentation">Thuyết trình</option>
                    <option value="workshop">Workshop</option>
                    <option value="panel">Panel</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sắp xếp theo</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="startTime">Thời gian</option>
                    <option value="title">Tiêu đề</option>
                    <option value="speaker">Diễn giả</option>
                    <option value="duration">Thời lượng</option>
                    <option value="feedbackScore">Đánh giá</option>
                    <option value="viewCount">Lượt xem</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm phiên họp, diễn giả, phòng, tags..."
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
                  <option value="live">Đang phát</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="ended">Đã kết thúc</option>
                </select>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-1" />
                  QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const SessionTypeIcon = getSessionTypeIcon(session.sessionType);
              return (
                <Card key={session.id} className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <SessionTypeIcon className="h-4 w-4 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getSessionTypeLabel(session.sessionType)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBookmark(session.id)}
                          className="p-1 h-8 w-8"
                        >
                          <Bookmark className={`h-4 w-4 ${session.isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleLike(session.id)}
                          className="p-1 h-8 w-8"
                        >
                          <Heart className={`h-4 w-4 ${session.isLiked ? 'fill-current text-red-500' : ''}`} />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {session.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {session.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(session.status)}
                      {getDifficultyBadge(session.difficulty)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Speaker Info */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {session.speakerAvatar ? (
                          <img 
                            src={session.speakerAvatar} 
                            alt={session.speaker}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.speaker}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.speakerTitle} tại {session.speakerCompany}
                        </p>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{session.localStartTime} - {session.localEndTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{session.room}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{session.attendees}/{session.maxAttendees}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(session.duration)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {session.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {session.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{session.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {session.isRecorded && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="h-3 w-3 mr-1" />
                          Ghi hình
                        </Badge>
                      )}
                      {session.hasQnA && (
                        <Badge variant="outline" className="text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Hỏi đáp
                        </Badge>
                      )}
                      {session.hasLiveStream && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Live Stream
                        </Badge>
                      )}
                      {session.accessibility.closedCaptions && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Phụ đề
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{session.viewCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{session.likeCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{session.feedbackScore.toFixed(1)}</span>
                        </span>
                      </div>
                      <span className="text-xs">
                        {session.language}
                      </span>
                    </div>

                    {/* Progress Bar for Live Sessions */}
                    {session.status === "live" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Tiến độ phiên</span>
                          <span>75%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full transition-all duration-300" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      {session.status === "live" && (
                        <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                          <Play className="h-4 w-4 mr-1" />
                          Tham gia
                        </Button>
                      )}
                      {session.status === "upcoming" && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Nhắc nhở
                        </Button>
                      )}
                      {session.status === "ended" && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Video className="h-4 w-4 mr-1" />
                          Xem lại
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách phiên họp ({filteredSessions.length})</CardTitle>
              <CardDescription>
                Xem tất cả phiên họp dưới dạng bảng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phiên họp</TableHead>
                    <TableHead>Diễn giả</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tham dự</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const SessionTypeIcon = getSessionTypeIcon(session.sessionType);
                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <SessionTypeIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{session.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getDifficultyBadge(session.difficulty)}
                              <Badge variant="outline" className="text-xs">
                                {getSessionTypeLabel(session.sessionType)}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{session.speaker}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.speakerTitle} tại {session.speakerCompany}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{session.localStartTime} - {session.localEndTime}</p>
                            <p className="text-xs text-muted-foreground">{formatDuration(session.duration)}</p>
                          </div>
                        </TableCell>
                        <TableCell>{session.room}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{session.attendees}/{session.maxAttendees}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-primary h-1 rounded-full" 
                                style={{ width: `${(session.attendees / session.maxAttendees) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {session.status === "live" && (
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {session.status === "upcoming" && (
                              <Button size="sm" variant="outline">
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}
                            {session.status === "ended" && (
                              <Button size="sm" variant="outline">
                                <Video className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <Card>
            <CardHeader>
              <CardTitle>Lịch trình theo thời gian</CardTitle>
              <CardDescription>
                Xem các phiên họp được sắp xếp theo thời gian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSessions.map((session, index) => {
                  const SessionTypeIcon = getSessionTypeIcon(session.sessionType);
                  const isLast = index === filteredSessions.length - 1;
                  return (
                    <div key={session.id} className="flex space-x-4">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {!isLast && <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>}
                      </div>
                      
                      {/* Session Content */}
                      <div className="flex-1 pb-8">
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <SessionTypeIcon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{session.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {session.localStartTime} - {session.localEndTime} • {formatDuration(session.duration)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(session.status)}
                                {getDifficultyBadge(session.difficulty)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{session.speaker}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{session.room}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{session.attendees}/{session.maxAttendees} tham dự</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex flex-wrap gap-1">
                                {session.tags.slice(0, 3).map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                {session.status === "live" && (
                                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                    <Play className="h-4 w-4 mr-1" />
                                    Tham gia
                                  </Button>
                                )}
                                {session.status === "upcoming" && (
                                  <Button size="sm" variant="outline">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Nhắc nhở
                                  </Button>
                                )}
                                {session.status === "ended" && (
                                  <Button size="sm" variant="outline">
                                    <Video className="h-4 w-4 mr-1" />
                                    Xem lại
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Stream Interface */}
        {selectedSession && selectedSession.status === "live" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-red-600" />
                    <span>Đang phát trực tiếp: {selectedSession.title}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedSession.speaker} • {selectedSession.room}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`bg-black rounded-lg overflow-hidden ${isFullscreen ? 'h-screen' : 'h-96'}`}>
                <div className="relative w-full h-full">
                  {/* Video Player Placeholder */}
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Live Stream</p>
                      <p className="text-sm text-gray-400">
                        {selectedSession.speaker} đang thuyết trình
                      </p>
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
                          </span>
                          <div className="w-32 h-1 bg-white/30 rounded-full">
                            <div 
                              className="h-1 bg-white rounded-full" 
                              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Live Chat/QA */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <h4 className="font-medium mb-2">Thảo luận trực tiếp</h4>
                  <div className="h-32 bg-gray-50 rounded-lg p-3 overflow-y-auto">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-blue-600">Nguyễn Văn A:</span>
                        <span className="ml-2">Câu hỏi rất hay về AI!</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-green-600">Trần Thị B:</span>
                        <span className="ml-2">Cảm ơn diễn giả đã chia sẻ</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Input placeholder="Nhập câu hỏi..." className="flex-1" />
                    <Button size="sm">Gửi</Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Thông tin phiên</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Thời gian:</span>
                      <span>{selectedSession.localStartTime} - {selectedSession.localEndTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phòng:</span>
                      <span>{selectedSession.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tham dự:</span>
                      <span>{selectedSession.attendees}/{selectedSession.maxAttendees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngôn ngữ:</span>
                      <span>{selectedSession.language}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Tài liệu</h5>
                    <div className="space-y-2">
                      {selectedSession.slidesUrl && (
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Slide thuyết trình
                        </Button>
                      )}
                      {selectedSession.resourcesUrl && (
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Tài liệu tham khảo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Details Modal */}
        {selectedSession && (
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết phiên họp</CardTitle>
              <CardDescription>
                Thông tin đầy đủ về phiên họp đã chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Mô tả</h3>
                    <p className="text-sm text-muted-foreground">{selectedSession.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Mục tiêu học tập</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedSession.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary">•</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Yêu cầu kỹ thuật</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Băng thông: {selectedSession.technicalRequirements.internetSpeed}</p>
                      <p>Thiết bị: {selectedSession.technicalRequirements.device.join(", ")}</p>
                      <p>Phần mềm: {selectedSession.technicalRequirements.software.join(", ")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Truy cập</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <QrCode className="h-4 w-4" />
                        <span className="text-sm">QR Code: {selectedSession.qrCode}</span>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {selectedSession.streamUrl && (
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4" />
                          <span className="text-sm">Stream URL</span>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Mạng xã hội</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Twitter: {selectedSession.socialMedia.twitter}</span>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">LinkedIn: {selectedSession.socialMedia.linkedin}</span>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedSession.socialMedia.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Truy cập</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>Phụ đề:</span>
                        <span className={selectedSession.accessibility.closedCaptions ? 'text-green-600' : 'text-red-600'}>
                          {selectedSession.accessibility.closedCaptions ? 'Có' : 'Không'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Ngôn ngữ ký hiệu:</span>
                        <span className={selectedSession.accessibility.signLanguage ? 'text-green-600' : 'text-red-600'}>
                          {selectedSession.accessibility.signLanguage ? 'Có' : 'Không'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Bản ghi:</span>
                        <span className={selectedSession.accessibility.transcript ? 'text-green-600' : 'text-red-600'}>
                          {selectedSession.accessibility.transcript ? 'Có' : 'Không'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </ConferencePermissionGuard>
    </MainLayout>
  );
}