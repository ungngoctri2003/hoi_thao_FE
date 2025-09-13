"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Building,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface ConferenceDetails {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  description: string;
  totalAttendees: number;
  totalSessions: number;
  organizer?: string;
  contactEmail?: string;
  website?: string;
}

interface ConferenceDetailsProps {
  conference: ConferenceDetails;
  isLoading?: boolean;
}

export function ConferenceDetails({
  conference,
  isLoading = false,
}: ConferenceDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
      case "finished":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "ongoing":
        return <CheckCircle className="h-4 w-4" />;
      case "upcoming":
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "completed":
      case "finished":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mt-2"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{conference.name}</CardTitle>
              <CardDescription className="text-base">
                Thông tin chi tiết hội nghị
              </CardDescription>
            </div>
          </div>
          <Badge
            className={`${getStatusColor(
              conference.status
            )} flex items-center space-x-1`}
          >
            {getStatusIcon(conference.status)}
            <span className="capitalize">{conference.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Conference Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Thời gian bắt đầu
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(conference.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Thời gian kết thúc
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(conference.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Địa điểm</p>
                  <p className="text-base font-semibold text-gray-900">
                    {conference.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng tham dự viên
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {conference.totalAttendees?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tổng số phiên
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {conference.totalSessions || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {conference.description && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Mô tả hội nghị
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {conference.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          {(conference.organizer ||
            conference.contactEmail ||
            conference.website) && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-3">
                Thông tin liên hệ
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {conference.organizer && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Tổ chức:</span>{" "}
                      {conference.organizer}
                    </span>
                  </div>
                )}
                {conference.contactEmail && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-blue-600">@</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">Email:</span>{" "}
                      {conference.contactEmail}
                    </span>
                  </div>
                )}
                {conference.website && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs text-green-600">🌐</span>
                    </div>
                    <a
                      href={conference.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
