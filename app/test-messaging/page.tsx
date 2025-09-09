"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessaging } from "@/hooks/use-messaging";
import { useAuth } from "@/hooks/use-auth";

export default function TestMessagingPage() {
  const { user, isAuthenticated } = useAuth();
  const [testMessage, setTestMessage] = useState("");
  const [testResults, setTestResults] = useState<string[]>([]);

  const {
    contacts,
    messages,
    selectedContact,
    isLoading,
    error,
    isConnected,
    selectContact,
    sendMessage,
    loadContacts
  } = useMessaging({ conferenceId: 1 });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testLoadContacts = async () => {
    try {
      addTestResult("Testing load contacts...");
      await loadContacts();
      addTestResult(`✅ Loaded ${contacts.length} contacts`);
    } catch (err) {
      addTestResult(`❌ Failed to load contacts: ${err}`);
    }
  };

  const testSelectContact = () => {
    if (contacts.length > 0) {
      addTestResult(`Testing select contact: ${contacts[0].name}`);
      selectContact(contacts[0]);
      addTestResult(`✅ Selected contact: ${contacts[0].name}`);
    } else {
      addTestResult("❌ No contacts available to select");
    }
  };

  const testSendMessage = async () => {
    if (!selectedContact || !testMessage.trim()) {
      addTestResult("❌ No contact selected or message empty");
      return;
    }

    try {
      addTestResult(`Testing send message: "${testMessage}"`);
      await sendMessage(testMessage);
      addTestResult(`✅ Message sent successfully`);
      setTestMessage("");
    } catch (err) {
      addTestResult(`❌ Failed to send message: ${err}`);
    }
  };

  const testWebSocketConnection = () => {
    if (isConnected) {
      addTestResult("✅ WebSocket connected");
    } else {
      addTestResult("❌ WebSocket not connected");
    }
  };

  useEffect(() => {
    addTestResult("Test page loaded");
    testWebSocketConnection();
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">Chưa đăng nhập</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messaging Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={testLoadContacts} disabled={isLoading}>
              Test Load Contacts
            </Button>
            <Button onClick={testSelectContact} disabled={contacts.length === 0}>
              Test Select Contact
            </Button>
            <Button onClick={testWebSocketConnection}>
              Test WebSocket
            </Button>
            <Button onClick={() => setTestResults([])}>
              Clear Results
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Send Test Message:</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter test message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testSendMessage()}
              />
              <Button onClick={testSendMessage} disabled={!selectedContact || !testMessage.trim()}>
                Send
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Status:</h3>
            <div className="text-sm space-y-1">
              <p>WebSocket: {isConnected ? "✅ Connected" : "❌ Disconnected"}</p>
              <p>Loading: {isLoading ? "⏳ Yes" : "✅ No"}</p>
              <p>Error: {error || "✅ None"}</p>
              <p>Contacts: {contacts.length}</p>
              <p>Messages: {messages.length}</p>
              <p>Selected Contact: {selectedContact?.name || "None"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Contacts:</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {contacts.map((contact) => (
                <div key={contact.id} className="text-sm p-2 bg-gray-50 rounded">
                  {contact.name} ({contact.email}) - {contact.isOnline ? "Online" : "Offline"}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Messages:</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="text-sm p-2 bg-gray-50 rounded">
                  {message.attendeeId ? `From ${message.attendeeId}` : "From You"}: {message.content}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}