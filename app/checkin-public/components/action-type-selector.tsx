"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";

interface ActionTypeSelectorProps {
  selectedAction: "checkin" | "checkout";
  onActionChange: (action: "checkin" | "checkout") => void;
}

export function ActionTypeSelector({ selectedAction, onActionChange }: ActionTypeSelectorProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Chọn loại hành động</CardTitle>
        <CardDescription>
          Vui lòng chọn Check-in (vào) hoặc Check-out (ra) trước khi quét QR
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={selectedAction === "checkin" ? "default" : "outline"}
            className={`h-24 flex flex-col gap-2 ${
              selectedAction === "checkin"
                ? "bg-green-600 hover:bg-green-700"
                : "hover:bg-green-50"
            }`}
            onClick={() => onActionChange("checkin")}
          >
            <LogIn className="h-8 w-8" />
            <span className="text-lg font-semibold">Check-in</span>
            <span className="text-xs opacity-80">Vào hội nghị</span>
          </Button>

          <Button
            variant={selectedAction === "checkout" ? "default" : "outline"}
            className={`h-24 flex flex-col gap-2 ${
              selectedAction === "checkout"
                ? "bg-blue-600 hover:bg-blue-700"
                : "hover:bg-blue-50"
            }`}
            onClick={() => onActionChange("checkout")}
          >
            <LogOut className="h-8 w-8" />
            <span className="text-lg font-semibold">Check-out</span>
            <span className="text-xs opacity-80">Ra khỏi hội nghị</span>
          </Button>
        </div>

        {/* Visual indicator */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Hành động hiện tại:</span>
            <div className="flex items-center gap-2">
              {selectedAction === "checkin" ? (
                <>
                  <LogIn className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">Check-in (Vào)</span>
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">Check-out (Ra)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

