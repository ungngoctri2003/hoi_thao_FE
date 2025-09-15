// Export utilities for dashboard data

export interface ExportData {
  [key: string]: any;
}

export interface ExportOptions {
  format: "csv" | "json" | "xlsx";
  filename?: string;
  includeTimestamp?: boolean;
}

export class ExportService {
  static generateFilename(
    baseName: string,
    format: string,
    includeTimestamp = true
  ): string {
    const timestamp = includeTimestamp
      ? `_${new Date().toISOString().split("T")[0]}`
      : "";
    return `${baseName}${timestamp}.${format}`;
  }

  static exportToCSV(data: ExportData[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    this.downloadFile(csvContent, filename, "text/csv");
  }

  static exportToJSON(data: ExportData[], filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, "application/json");
  }

  static exportToXLSX(data: ExportData[], filename: string): void {
    // For XLSX export, we'll use a simple approach
    // In a real application, you might want to use a library like 'xlsx'
    console.warn("XLSX export not implemented. Falling back to CSV.");
    this.exportToCSV(data, filename.replace(".xlsx", ".csv"));
  }

  private static downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  static exportDashboardData(
    data: ExportData[],
    options: ExportOptions = { format: "csv" }
  ): void {
    const filename =
      options.filename ||
      this.generateFilename(
        "dashboard_data",
        options.format,
        options.includeTimestamp
      );

    switch (options.format) {
      case "csv":
        this.exportToCSV(data, filename);
        break;
      case "json":
        this.exportToJSON(data, filename);
        break;
      case "xlsx":
        this.exportToXLSX(data, filename);
        break;
      default:
        console.error("Unsupported export format:", options.format);
    }
  }
}

// Dashboard-specific export functions
export const DashboardExports = {
  exportConferenceStats: (conferences: any[]) => {
    const data = conferences.map((conf) => ({
      "Tên hội nghị": conf.NAME || conf.name,
      "Ngày bắt đầu": conf.START_DATE || conf.startDate,
      "Ngày kết thúc": conf.END_DATE || conf.endDate,
      "Địa điểm": conf.LOCATION || conf.location,
      "Trạng thái": conf.STATUS || conf.status,
      "Số đăng ký": conf.totalRegistrations || conf.attendees || 0,
    }));

    ExportService.exportDashboardData(data, {
      format: "csv",
      filename: "conference_stats.csv",
    });
  },

  exportCheckInData: (checkIns: any[]) => {
    const data = checkIns.map((checkIn) => ({
      "Thời gian": checkIn.timestamp || checkIn.time,
      "Số lượng check-in": checkIn.count || checkIn.checkins || 0,
    }));

    ExportService.exportDashboardData(data, {
      format: "csv",
      filename: "checkin_data.csv",
    });
  },

  exportRegistrationTrends: (trends: any[]) => {
    const data = trends.map((trend) => ({
      Ngày: trend.date || trend.timestamp,
      "Số đăng ký": trend.count || trend.registrations || 0,
    }));

    ExportService.exportDashboardData(data, {
      format: "csv",
      filename: "registration_trends.csv",
    });
  },

  exportRecentActivity: (activities: any[]) => {
    const data = activities.map((activity) => ({
      "Loại hoạt động": activity.type,
      "Mô tả": activity.message || activity.description,
      "Thời gian": activity.timestamp || activity.createdAt,
    }));

    ExportService.exportDashboardData(data, {
      format: "csv",
      filename: "recent_activity.csv",
    });
  },
};
