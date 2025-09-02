"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, AlertCircle, Cloud } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { useNotification } from "@/hooks/use-notification"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  label?: string
  required?: boolean
  maxSize?: number // in MB
  acceptedTypes?: string[]
  onUploadStateChange?: (isUploading: boolean) => void // Callback to notify parent about upload state
}

export function ImageUpload({
  value,
  onChange,
  error,
  label = "Ảnh đại diện",
  required = false,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  onUploadStateChange
}: ImageUploadProps) {
  const { showSuccess, showError, showWarning } = useNotification()
  
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string>("")
  const [isCloudUploading, setIsCloudUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL(file.type, quality)
        resolve(compressedDataUrl)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (file: File) => {
    setUploadError("")
    
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError("Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP.")
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn ${maxSize}MB.`)
      return
    }

    setIsUploading(true)
    onUploadStateChange?.(true) // Notify parent that upload is starting

    try {
      // Compress image if it's large
      let dataUrl: string
      if (file.size > 1024 * 1024) { // If larger than 1MB, compress
        dataUrl = await compressImage(file, 800, 0.8)
      } else {
        // Create preview without compression for small files
        const reader = new FileReader()
        dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      }

      setPreview(dataUrl)
      
      // Try to upload to cloud storage, but fallback to base64 if CORS or other issues
      setIsCloudUploading(true)
      try {
        console.log('🔄 Attempting to upload image to cloud...')
        const uploadResult = await apiClient.uploadImage(dataUrl)
        console.log('📤 Upload result:', uploadResult)
        console.log('🔗 Cloud URL:', uploadResult.url)
        onChange(uploadResult.url) // Use cloud URL instead of base64
        setPreview(uploadResult.url) // Update preview with cloud URL
        showSuccess('Upload thành công', 'Ảnh đã được tải lên cloud thành công')
      } catch (cloudError) {
        console.warn('❌ Failed to upload to cloud, using base64:', cloudError)
        // Check if it's a CORS error
        const errorMessage = cloudError instanceof Error ? cloudError.message : String(cloudError);
        if (errorMessage?.includes('CORS') || errorMessage?.includes('cors')) {
          setUploadError("Lỗi CORS: Không thể upload lên cloud. Sử dụng ảnh local.")
        } else if (errorMessage?.includes('404') || errorMessage?.includes('Not Found')) {
          setUploadError("Endpoint upload không tồn tại. Sử dụng ảnh local.")
        } else {
          setUploadError("Không thể upload lên cloud. Sử dụng ảnh local.")
        }
        console.log('🔄 Using base64 fallback:', dataUrl.substring(0, 50) + '...')
        onChange(dataUrl) // Fallback to base64
        setPreview(dataUrl) // Update preview with base64
      } finally {
        setIsCloudUploading(false)
      }
    } catch (error) {
      setUploadError("Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.")
    } finally {
      setIsUploading(false)
      onUploadStateChange?.(false) // Notify parent that upload is finished
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeImage = () => {
    setPreview(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="space-y-4">
        {/* Upload Area */}
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? "border-primary bg-primary/5" 
              : preview 
                ? "border-green-200 bg-green-50" 
                : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="p-6">
            {preview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage()
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">Ảnh đã được tải lên</p>
                  <p className="text-xs text-muted-foreground">Nhấp để thay đổi ảnh</p>
                  {preview.startsWith('data:image/') ? (
                    <p className="text-xs text-orange-600 mt-1">
                      📁 Lưu local (base64) - Kích thước: {Math.round(preview.length * 0.75 / 1024)}KB
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1">
                      ☁️ Lưu trên cloud
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  {isUploading || isCloudUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      {isCloudUploading && (
                        <Cloud className="h-4 w-4 text-blue-500 mt-1" />
                      )}
                    </div>
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {isUploading ? "Đang xử lý ảnh..." : 
                     isCloudUploading ? "Đang tải lên cloud..." : 
                     "Kéo thả ảnh vào đây hoặc nhấp để chọn"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hỗ trợ: JPG, PNG, GIF, WebP (tối đa {maxSize}MB)
                  </p>
                  <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✅ Ảnh sẽ được lưu trữ trên cloud (nếu có) hoặc dưới dạng base64
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />

        {/* URL input - primary method */}
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="url"
              placeholder="Nhập URL ảnh đại diện (khuyến nghị)"
              value={value || ""}
              onChange={(e) => {
                onChange(e.target.value)
                if (e.target.value) {
                  setPreview(e.target.value)
                }
              }}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Bạn có thể nhập URL ảnh hoặc upload file trực tiếp (sẽ được lưu trên cloud)
          </p>
        </div>

        {/* Error messages */}
        {(error || uploadError) && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
              <span className="text-sm text-red-800 dark:text-red-200">
                {error || uploadError}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
