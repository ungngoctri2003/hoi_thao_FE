import { GlobalLoading } from "@/components/ui/global-loading";

export default function Loading() {
  return (
    <GlobalLoading
      message="Đang tải thông tin địa điểm..."
      variant="fullscreen"
    />
  );
}
