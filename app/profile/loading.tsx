import { GlobalLoading } from "@/components/ui/global-loading";

export default function Loading() {
  return (
    <GlobalLoading
      message="Đang tải thông tin cá nhân..."
      variant="fullscreen"
    />
  );
}
