import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, User, FileText } from "lucide-react";

interface ConferenceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conference: {
    id: string;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    registered: number;
    status: "draft" | "published" | "active" | "completed" | "cancelled";
    category: string;
    organizer: string;
    createdAt: string;
  } | null;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  published: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  active: "Đang diễn ra",
  completed: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export function ConferenceDetailDialog({
  open,
  onOpenChange,
  conference,
}: ConferenceDetailDialogProps) {
  if (!conference) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Chi tiết hội nghị</span>
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về hội nghị "{conference.name}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">{conference.name}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={statusColors[conference.status]}>
                {statusLabels[conference.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {conference.category}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground">{conference.description}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{conference.date}</span>
              <span className="text-xs text-muted-foreground">
                {conference.time}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{conference.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>
                {conference.registered}/{conference.capacity} đã đăng ký
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{conference.organizer}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Ngày tạo: {conference.createdAt}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
