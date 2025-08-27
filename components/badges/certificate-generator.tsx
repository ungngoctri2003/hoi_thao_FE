"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Award, Calendar, User } from "lucide-react"

interface UserBadge {
  id: string
  name: string
  earnedAt?: Date
  points: number
}

interface UserStats {
  totalBadges: number
  totalPoints: number
  level: number
}

interface CertificateGeneratorProps {
  badges: UserBadge[]
  userStats: UserStats
}

export default function CertificateGenerator({ badges, userStats }: CertificateGeneratorProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null)

  // Generate available certificates based on achievements
  const certificates = [
    {
      id: "participation",
      name: "Chứng chỉ Tham gia Hội nghị",
      description: "Chứng nhận tham gia đầy đủ hội nghị",
      requirements: "Tham dự ít nhất 5 phiên họp",
      available: badges.length >= 3,
      template: "participation-template",
    },
    {
      id: "engagement",
      name: "Chứng chỉ Tương tác Tích cực",
      description: "Chứng nhận tham gia tích cực các hoạt động tương tác",
      requirements: "Đạt ít nhất 3 huy hiệu tương tác",
      available:
        badges.filter((b) => b.id.includes("qa") || b.id.includes("poll") || b.id.includes("feedback")).length >= 2,
      template: "engagement-template",
    },
    {
      id: "networking",
      name: "Chứng chỉ Kết nối Chuyên nghiệp",
      description: "Chứng nhận kỹ năng kết nối và xây dựng mạng lưới",
      requirements: "Hoàn thành huy hiệu networking",
      available: badges.some((b) => b.id === "networking-pro"),
      template: "networking-template",
    },
    {
      id: "completion",
      name: "Chứng chỉ Hoàn thành Hội nghị",
      description: "Chứng nhận hoàn thành toàn bộ chương trình hội nghị",
      requirements: "Đạt cấp độ 3 và 10+ huy hiệu",
      available: userStats.level >= 3 && badges.length >= 10,
      template: "completion-template",
    },
  ]

  const handleDownloadCertificate = (certificateId: string) => {
    // Simulate certificate download
    const link = document.createElement("a")
    link.href = `/certificates/${certificateId}.pdf`
    link.download = `certificate-${certificateId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShareCertificate = (certificateId: string) => {
    if (navigator.share) {
      navigator.share({
        title: "Chứng chỉ Hội nghị",
        text: "Tôi vừa nhận được chứng chỉ từ hội nghị!",
        url: window.location.href,
      })
    }
  }

  const CertificatePreview = ({ certificate }: { certificate: any }) => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600">
      <div className="text-center space-y-4">
        <div className="text-4xl">🏆</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CHỨNG CHỈ</h2>
        <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{certificate.name}</h3>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md mx-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Chứng nhận rằng</p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <User className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-lg">Nguyễn Văn A</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{certificate.description}</p>

          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date().toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="h-3 w-3" />
              <span>Cấp độ {userStats.level}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <Button onClick={() => handleDownloadCertificate(certificate.id)} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Tải xuống PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleShareCertificate(certificate.id)}
            className="flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Chia sẻ</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Certificate Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Chứng chỉ có sẵn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Dựa trên thành tích của bạn, các chứng chỉ sau đây có thể được tạo và tải xuống.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className={`cursor-pointer transition-all ${
                  cert.available
                    ? "border-green-300 dark:border-green-600 hover:shadow-md"
                    : "border-gray-200 dark:border-gray-700 opacity-60"
                } ${selectedCertificate === cert.id ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => cert.available && setSelectedCertificate(cert.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{cert.name}</h3>
                    <Badge variant={cert.available ? "default" : "secondary"}>
                      {cert.available ? "Có sẵn" : "Chưa đủ điều kiện"}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{cert.description}</p>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Yêu cầu:</strong> {cert.requirements}
                  </div>

                  {cert.available && (
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" onClick={() => setSelectedCertificate(cert.id)}>
                        Xem trước
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadCertificate(cert.id)}>
                        <Download className="h-3 w-3 mr-1" />
                        Tải xuống
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Preview */}
      {selectedCertificate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xem trước chứng chỉ</CardTitle>
          </CardHeader>
          <CardContent>
            <CertificatePreview certificate={certificates.find((c) => c.id === selectedCertificate)} />
          </CardContent>
        </Card>
      )}

      {/* Achievement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tóm tắt thành tích</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{badges.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Huy hiệu đạt được</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.totalPoints}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tổng điểm</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.level}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cấp độ hiện tại</div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Huy hiệu gần đây:</h4>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 5).map((badge) => (
                <Badge key={badge.id} variant="outline">
                  {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
