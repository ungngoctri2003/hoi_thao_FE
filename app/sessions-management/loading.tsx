import { GlobalLoading } from "@/components/ui/global-loading";

export default function Loading() {
  return (
    <GlobalLoading
      message="Đang tải trang quản lý phiên..."
      variant="fullscreen"
    />
  );
}
