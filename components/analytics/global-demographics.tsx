"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DemographicsData {
  ageGroups: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  industries: Array<{
    industry: string;
    count: number;
    percentage: number;
  }>;
}

interface GlobalDemographicsProps {
  demographics: DemographicsData;
  isLoading: boolean;
}

export function GlobalDemographics({
  demographics,
  isLoading,
}: GlobalDemographicsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm group hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 p-2">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl">Phân bố độ tuổi</CardTitle>
              <CardDescription className="text-base">
                Thống kê tham dự viên theo độ tuổi (toàn hệ thống)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {demographics.ageGroups.map((group, index) => (
                <div key={index} className="group/item">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {group.range} tuổi
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-blue-600">
                        {group.count} người
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {group.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out group-hover/item:from-blue-600 group-hover/item:to-cyan-600"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm group hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-2">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl">Ngành nghề</CardTitle>
              <CardDescription className="text-base">
                Phân bố tham dự viên theo lĩnh vực (toàn hệ thống)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {demographics.industries.map((industry, index) => (
                <div key={index} className="group/item">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {industry.industry}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-green-600">
                        {industry.count} người
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {industry.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out group-hover/item:from-green-600 group-hover/item:to-emerald-600"
                      style={{ width: `${industry.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
