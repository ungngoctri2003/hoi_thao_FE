import { GlobalLoading } from "@/components/ui/global-loading";

export default function Loading() {
  return (
    <GlobalLoading
      message="Đang tải danh sách tham dự..."
      variant="fullscreen"
    />
  );
}
