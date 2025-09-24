"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { checkInAPI } from "../checkin-public/lib/checkin-api";
import { MOCK_DATA } from "../checkin-public/config/api-config";

export default function TestQRDebugPage() {
  const [qrCode, setQrCode] = useState("");
  const [conferenceId, setConferenceId] = useState("1");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateTestQR = () => {
    const testQR = MOCK_DATA.ATTENDEES[0].qrCode;
    setQrCode(testQR);
  };

  const validateQR = async () => {
    if (!qrCode.trim()) return;

    setIsLoading(true);
    try {
      const validation = await checkInAPI.validateQRCode(
        qrCode,
        parseInt(conferenceId)
      );
      setResult(validation);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testCheckIn = async () => {
    if (!qrCode.trim()) return;

    setIsLoading(true);
    try {
      const response = await checkInAPI.checkInAttendee({
        attendeeId: 1,
        qrCode: qrCode,
        conferenceId: parseInt(conferenceId),
        checkInMethod: "qr",
      });
      setResult({ checkInResult: response });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">QR Code Debug Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="conferenceId">Conference ID</Label>
              <Input
                id="conferenceId"
                value={conferenceId}
                onChange={(e) => setConferenceId(e.target.value)}
                type="number"
              />
            </div>

            <div>
              <Label htmlFor="qrCode">QR Code Data</Label>
              <Textarea
                id="qrCode"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Paste QR code data here..."
                rows={6}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={generateTestQR} variant="outline">
                Generate Test QR
              </Button>
              <Button onClick={validateQR} disabled={isLoading}>
                {isLoading ? "Validating..." : "Validate QR"}
              </Button>
              <Button
                onClick={testCheckIn}
                disabled={isLoading}
                variant="secondary"
              >
                {isLoading ? "Testing..." : "Test Check-in"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {result ? JSON.stringify(result, null, 2) : "No result yet"}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mock Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Conferences:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(MOCK_DATA.CONFERENCES, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Attendees:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(MOCK_DATA.ATTENDEES, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
