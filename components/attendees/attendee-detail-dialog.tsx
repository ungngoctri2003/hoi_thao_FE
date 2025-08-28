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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Users,
  Building2,
  Calendar,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

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

interface AttendeeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendee: Attendee | null;
}

export function AttendeeDetailDialog({
  open,
  onOpenChange,
  attendee,
}: AttendeeDetailDialogProps) {
  if (!attendee) return null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Chi tiết người tham dự</span>
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về người tham dự hội nghị
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={attendee.avatar || "/placeholder.svg"} />
            <AvatarFallback>{getInitials(attendee.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-xl font-bold">{attendee.name}</div>
            <div className="text-sm text-muted-foreground">
              {attendee.position}
            </div>
            <Badge className={statusColors[attendee.status]}>
              {statusLabels[attendee.status]}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{attendee.conference}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Đăng ký: {attendee.registrationDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span>Nhu cầu ăn uống: {attendee.dietary || "Không"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span>Nhu cầu đặc biệt: {attendee.specialNeeds || "Không"}</span>
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
