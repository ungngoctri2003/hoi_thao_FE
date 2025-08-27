"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Camera, AlertCircle, RefreshCw } from "lucide-react"
import { QrCode } from "lucide-react" // Declare the QrCode variable

interface QRScannerProps {
  onScan: (data: string) => void
  isActive: boolean
}

export function QRScanner({ onScan, isActive }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isActive])

  const startCamera = async () => {
    setIsLoading(true)
    setError("")

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err) {
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera.")
      console.error("Camera access error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Simulate QR code detection (in a real app, you'd use a QR code library)
  const simulateQRDetection = () => {
    const mockQRCodes = ["QR001234567", "QR001234568", "QR001234569"]
    const randomCode = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)]
    onScan(randomCode)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={startCamera} variant="outline" className="w-full bg-transparent">
          <RefreshCw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="aspect-video flex items-center justify-center">
            <div className="text-white text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Đang khởi động camera...</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.play()
                }
              }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* QR Code Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <QrCode className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Hướng mã QR vào khung này</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/70 text-white p-3 rounded-lg text-center">
                <p className="text-sm">Giữ camera ổn định và hướng vào mã QR</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Demo Button (remove in production) */}
      <div className="text-center">
        <Button onClick={simulateQRDetection} variant="outline" size="sm">
          <Camera className="mr-2 h-4 w-4" />
          Demo: Mô phỏng quét QR
        </Button>
        <p className="text-xs text-muted-foreground mt-1">Chỉ dùng để demo - sẽ tạo mã QR ngẫu nhiên</p>
      </div>
    </div>
  )
}
