"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ArrowLeft, ArrowRight, AlertCircle, User, Building, Calendar, FileText } from "lucide-react"

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string

  // Professional Information
  company: string
  position: string
  industry: string
  experience: string

  // Event Information
  conference: string
  sessions: string[]
  dietary: string
  specialNeeds: string

  // Additional Information
  hearAbout: string
  expectations: string
  networking: boolean
  newsletter: boolean
  terms: boolean
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  company: "",
  position: "",
  industry: "",
  experience: "",
  conference: "",
  sessions: [],
  dietary: "",
  specialNeeds: "",
  hearAbout: "",
  expectations: "",
  networking: false,
  newsletter: false,
  terms: false,
}

const steps = [
  {
    id: 1,
    title: "Thông tin cá nhân",
    description: "Thông tin cơ bản về bạn",
    icon: User,
  },
  {
    id: 2,
    title: "Thông tin nghề nghiệp",
    description: "Công việc và kinh nghiệm",
    icon: Building,
  },
  {
    id: 3,
    title: "Thông tin sự kiện",
    description: "Lựa chọn hội nghị và phiên",
    icon: Calendar,
  },
  {
    id: 4,
    title: "Thông tin bổ sung",
    description: "Yêu cầu đặc biệt và mong đợi",
    icon: FileText,
  },
]

const conferences = [
  "Hội nghị Công nghệ 2024",
  "Workshop AI & Machine Learning",
  "Seminar Khởi nghiệp",
  "Hội thảo Y tế",
]

const sessions = [
  "Keynote: Tương lai của AI",
  "Workshop: Machine Learning cơ bản",
  "Panel: Startup trong thời đại số",
  "Thảo luận: Đổi mới công nghệ",
  "Networking: Kết nối doanh nghiệp",
]

export function AttendeeRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const router = useRouter()

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.firstName) newErrors.firstName = "Vui lòng nhập họ"
        if (!formData.lastName) newErrors.lastName = "Vui lòng nhập tên"
        if (!formData.email) newErrors.email = "Vui lòng nhập email"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ"
        if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại"
        if (!formData.gender) newErrors.gender = "Vui lòng chọn giới tính"
        break
      case 2:
        if (!formData.company) newErrors.company = "Vui lòng nhập tên công ty"
        if (!formData.position) newErrors.position = "Vui lòng nhập chức vụ"
        if (!formData.industry) newErrors.industry = "Vui lòng chọn ngành nghề"
        if (!formData.experience) newErrors.experience = "Vui lòng chọn kinh nghiệm"
        break
      case 3:
        if (!formData.conference) newErrors.conference = "Vui lòng chọn hội nghị"
        break
      case 4:
        if (!formData.terms) newErrors.terms = "Vui lòng đồng ý với điều khoản"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsComplete(true)
    }, 2000)
  }

  const handleSessionToggle = (session: string) => {
    const currentSessions = formData.sessions
    if (currentSessions.includes(session)) {
      updateFormData(
        "sessions",
        currentSessions.filter((s) => s !== session),
      )
    } else {
      updateFormData("sessions", [...currentSessions, session])
    }
  }

  if (isComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold">Đăng ký thành công!</CardTitle>
          <CardDescription>
            Cảm ơn bạn đã đăng ký tham dự hội nghị. Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Thông tin đăng ký:</h4>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Họ tên:</strong> {formData.firstName} {formData.lastName}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Hội nghị:</strong> {formData.conference}
              </p>
              <p>
                <strong>Số phiên đã chọn:</strong> {formData.sessions.length}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                router.push(
                  "/dashboard?role=attendee&name=" + encodeURIComponent(formData.firstName + " " + formData.lastName),
                )
              }
              className="flex-1"
            >
              Đến trang chủ
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              In phiếu đăng ký
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-2 text-center">
          <h2 className="text-xl font-serif font-bold">{steps[currentStep - 1].title}</h2>
          <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    placeholder="Nhập họ"
                  />
                  {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    placeholder="Nhập tên"
                  />
                  {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="0901234567"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Giới tính *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => updateFormData("gender", value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Nam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Nữ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Khác</Label>
                  </div>
                </RadioGroup>
                {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Professional Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Tên công ty *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateFormData("company", e.target.value)}
                  placeholder="Nhập tên công ty"
                />
                {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Chức vụ *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => updateFormData("position", e.target.value)}
                  placeholder="Nhập chức vụ hiện tại"
                />
                {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Ngành nghề *</Label>
                  <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngành nghề" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Công nghệ thông tin</SelectItem>
                      <SelectItem value="finance">Tài chính - Ngân hàng</SelectItem>
                      <SelectItem value="healthcare">Y tế - Sức khỏe</SelectItem>
                      <SelectItem value="education">Giáo dục</SelectItem>
                      <SelectItem value="manufacturing">Sản xuất</SelectItem>
                      <SelectItem value="retail">Bán lẻ</SelectItem>
                      <SelectItem value="consulting">Tư vấn</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.industry && <p className="text-sm text-red-600">{errors.industry}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Kinh nghiệm *</Label>
                  <Select value={formData.experience} onValueChange={(value) => updateFormData("experience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kinh nghiệm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 năm</SelectItem>
                      <SelectItem value="1-3">1-3 năm</SelectItem>
                      <SelectItem value="3-5">3-5 năm</SelectItem>
                      <SelectItem value="5-10">5-10 năm</SelectItem>
                      <SelectItem value="10+">Trên 10 năm</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Event Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conference">Chọn hội nghị *</Label>
                <Select value={formData.conference} onValueChange={(value) => updateFormData("conference", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hội nghị muốn tham dự" />
                  </SelectTrigger>
                  <SelectContent>
                    {conferences.map((conference) => (
                      <SelectItem key={conference} value={conference}>
                        {conference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.conference && <p className="text-sm text-red-600">{errors.conference}</p>}
              </div>

              <div className="space-y-2">
                <Label>Chọn phiên tham dự (tùy chọn)</Label>
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session} className="flex items-center space-x-2">
                      <Checkbox
                        id={session}
                        checked={formData.sessions.includes(session)}
                        onCheckedChange={() => handleSessionToggle(session)}
                      />
                      <Label htmlFor={session} className="text-sm">
                        {session}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dietary">Yêu cầu ăn uống</Label>
                  <Select value={formData.dietary} onValueChange={(value) => updateFormData("dietary", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn yêu cầu ăn uống" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không có yêu cầu đặc biệt</SelectItem>
                      <SelectItem value="vegetarian">Chay</SelectItem>
                      <SelectItem value="vegan">Thuần chay</SelectItem>
                      <SelectItem value="halal">Halal</SelectItem>
                      <SelectItem value="gluten-free">Không gluten</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Yêu cầu hỗ trợ đặc biệt</Label>
                <Textarea
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={(e) => updateFormData("specialNeeds", e.target.value)}
                  placeholder="Mô tả các yêu cầu hỗ trợ đặc biệt (xe lăn, phiên dịch, v.v.)"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hearAbout">Bạn biết về sự kiện này qua đâu?</Label>
                <Select value={formData.hearAbout} onValueChange={(value) => updateFormData("hearAbout", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nguồn thông tin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social-media">Mạng xã hội</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="colleague">Đồng nghiệp</SelectItem>
                    <SelectItem value="advertisement">Quảng cáo</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectations">Mong đợi của bạn từ sự kiện này</Label>
                <Textarea
                  id="expectations"
                  value={formData.expectations}
                  onChange={(e) => updateFormData("expectations", e.target.value)}
                  placeholder="Chia sẻ những gì bạn mong đợi học hỏi hoặc đạt được từ sự kiện"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="networking"
                    checked={formData.networking}
                    onCheckedChange={(checked) => updateFormData("networking", checked)}
                  />
                  <Label htmlFor="networking" className="text-sm">
                    Tôi muốn tham gia các hoạt động networking
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => updateFormData("newsletter", checked)}
                  />
                  <Label htmlFor="newsletter" className="text-sm">
                    Đăng ký nhận bản tin về các sự kiện sắp tới
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => updateFormData("terms", checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-primary hover:underline">
                      điều khoản và điều kiện
                    </a>{" "}
                    *
                  </Label>
                </div>
                {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
              </div>

              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc.</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Tiếp theo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Hoàn tất đăng ký"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
