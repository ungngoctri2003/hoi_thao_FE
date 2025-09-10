import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./use-websocket";
import { messagingApi, Message, ChatContact } from "@/lib/api/messaging";
import { websocketService } from "@/lib/websocket";
import { apiClient } from "@/lib/api";

interface UseMessagingOptions {
  conferenceId: number;
  sessionId?: number;
  userId?: number;
}

export function useMessaging({
  conferenceId,
  sessionId,
  userId,
}: UseMessagingOptions) {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(
    sessionId || null
  );
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  const { isConnected, joinRoom, leaveRoom, on, off } = useWebSocket({
    onConnect: () => {
      console.log("WebSocket connected");
    },
    onDisconnect: () => {
      console.log("WebSocket disconnected");
    },
    onError: (err) => {
      console.warn(
        "WebSocket error (messaging will work without real-time):",
        err
      );
      // Don't set error for WebSocket issues, messaging can work without real-time
    },
  });

  // Load contacts (attendees) for the conference
  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsersWithMessages();
      setContacts(response.data);
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setError("Không thể tải danh sách liên hệ");
    } finally {
      setIsLoading(false);
    }
  }, [conferenceId]);

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId: number) => {
    try {
      const sessionMessages = await apiClient.getConversationMessages(
        sessionId,
        50,
        0
      );
      setMessages(sessionMessages as Message[]);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Không thể tải tin nhắn");
    }
  }, []);

  // Send a message using WebSocket
  const sendMessage = useCallback(
    async (content: string, type: "text" | "image" | "file" = "text") => {
      if (!currentSessionId || !content.trim() || !userId) return;

      try {
        // Check WebSocket connection first
        if (!websocketService.isSocketConnected()) {
          console.warn("WebSocket not connected, attempting to reconnect...");
          websocketService.connect();
          // Wait a bit for connection
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Send via API first
        const message = (await apiClient.sendConversationMessage(
          currentSessionId,
          content,
          type,
          selectedContact?.id
        )) as any;

        // Send via WebSocket for real-time delivery
        if (websocketService.isSocketConnected()) {
          websocketService.sendMessage({
            sessionId: currentSessionId,
            content,
            type,
            attendeeId: selectedContact?.id,
            senderId: userId,
          });
          console.log("Message sent via WebSocket");
        } else {
          console.warn("WebSocket not connected, message sent via API only");
        }

        // Add message to local state
        const newMessage: Message = {
          id: message.id || `temp-${Date.now()}`,
          sessionId: currentSessionId,
          content,
          type,
          timestamp: new Date(message.createdAt || new Date()),
          attendeeId: selectedContact?.id || null,
          senderId: userId,
          isRead: false,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Update contact's last message
        if (selectedContact) {
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === selectedContact.id
                ? { ...contact, lastMessage: content, unreadCount: 0 }
                : contact
            )
          );
        }
      } catch (err) {
        console.error("Failed to send message:", err);
        setError("Không thể gửi tin nhắn");
      }
    },
    [currentSessionId, selectedContact, userId]
  );

  // Select a contact and load their messages
  const selectContact = useCallback(
    async (contact: ChatContact) => {
      setSelectedContact(contact);

      try {
        // Try to get or create a session for this conversation
        const sessionId = await apiClient.getOrCreateConversationSession(
          conferenceId,
          userId || 0,
          contact.id
        );
        setCurrentSessionId(sessionId);
        loadMessages(sessionId);

        // Join conversation room via WebSocket
        if (userId && websocketService.isSocketConnected()) {
          websocketService.joinConversation(sessionId, userId);
          console.log(`Joined conversation room: session:${sessionId}`);
        } else if (userId) {
          console.warn(
            "WebSocket not connected, cannot join conversation room"
          );
          // Try to reconnect
          websocketService.connect();
        }
      } catch (error) {
        console.error("Failed to get/create session:", error);
        // Fallback to mock session ID
        const mockSessionId = contact.id + 1000;
        setCurrentSessionId(mockSessionId);
        loadMessages(mockSessionId);

        // Join conversation room via WebSocket
        if (userId && websocketService.isSocketConnected()) {
          websocketService.joinConversation(mockSessionId, userId);
          console.log(
            `Joined fallback conversation room: session:${mockSessionId}`
          );
        }
      }
    },
    [loadMessages, conferenceId, userId]
  );

  // Search contacts
  const searchContacts = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        // Don't reload all contacts, just keep current state
        return;
      }

      try {
        setIsSearching(true);
        const response = await apiClient.getUsersWithMessages();
        const searchResults = response.data.filter(
          (contact: any) =>
            contact.name?.toLowerCase().includes(query.toLowerCase()) ||
            contact.email?.toLowerCase().includes(query.toLowerCase())
        );
        setContacts(searchResults);
      } catch (err) {
        console.error("Failed to search contacts:", err);
        setError("Không thể tìm kiếm liên hệ");
      } finally {
        setIsSearching(false);
      }
    },
    [conferenceId]
  );

  // Search all users in the system
  const searchAllUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return;
      }

      try {
        setIsSearching(true);
        const response = await apiClient.getUsersByConferenceCategory(
          conferenceId
        );
        const searchResults = response.data.filter(
          (user: any) =>
            user.name?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase())
        );
        setContacts(searchResults);
      } catch (err) {
        console.error("Failed to search all users:", err);
        setError("Không thể tìm kiếm người dùng");
      } finally {
        setIsSearching(false);
      }
    },
    [conferenceId]
  );

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    // Join session room for real-time messages
    if (currentSessionId) {
      joinRoom(`session:${currentSessionId}`);
    }

    // Listen for new messages
    const handleNewMessage = (message: any) => {
      console.log("Received new message via WebSocket:", message);

      // Convert backend message format to frontend format
      const formattedMessage: Message = {
        id: message.ID || message.id,
        sessionId:
          message.SESSION_ID || message.sessionId || currentSessionId || 0,
        content: message.CONTENT || message.content,
        type: (message.MESSAGE_TYPE || message.type || "text") as
          | "text"
          | "image"
          | "file",
        timestamp: new Date(message.CREATED_AT || message.timestamp),
        attendeeId: message.ATTENDEE_ID || message.attendeeId,
        senderId: message.SENDER_ID || message.senderId,
        isRead: message.IS_READ || message.isRead || false,
      };

      setMessages((prev) => {
        // Avoid duplicate messages by checking both ID and content
        const exists = prev.some(
          (m) =>
            m.id === formattedMessage.id ||
            (m.content === formattedMessage.content &&
              m.senderId === formattedMessage.senderId &&
              Math.abs(
                new Date(m.timestamp).getTime() -
                  new Date(formattedMessage.timestamp).getTime()
              ) < 1000)
        );
        if (exists) {
          console.log("Duplicate message detected, skipping");
          return prev;
        }
        console.log("Adding new message to state");
        return [...prev, formattedMessage];
      });

      // Update contact's last message if it's from the selected contact
      if (
        selectedContact &&
        (formattedMessage.attendeeId === selectedContact.id ||
          formattedMessage.senderId === selectedContact.id)
      ) {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === selectedContact.id
              ? { ...contact, lastMessage: formattedMessage.content }
              : contact
          )
        );
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data: {
      sessionId: number;
      userId: number;
      isTyping: boolean;
    }) => {
      console.log("Received typing event:", data);
      if (data.sessionId === currentSessionId && data.userId !== userId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    // Listen for stop typing
    const handleUserStopTyping = (data: {
      sessionId: number;
      userId: number;
    }) => {
      console.log("Received stop typing event:", data);
      if (data.sessionId === currentSessionId && data.userId !== userId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    // Listen for message read status
    const handleMessageRead = (data: { messageId: number; userId: number }) => {
      console.log("Received message read event:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId.toString() ? { ...msg, isRead: true } : msg
        )
      );
    };

    // Setup WebSocket listeners using custom events
    const handleWebSocketNewMessage = (event: CustomEvent) =>
      handleNewMessage(event.detail);
    const handleWebSocketUserTyping = (event: CustomEvent) =>
      handleUserTyping(event.detail);
    const handleWebSocketUserStopTyping = (event: CustomEvent) =>
      handleUserStopTyping(event.detail);
    const handleWebSocketMessageRead = (event: CustomEvent) =>
      handleMessageRead(event.detail);

    window.addEventListener(
      "websocket-new-message",
      handleWebSocketNewMessage as EventListener
    );
    window.addEventListener(
      "websocket-user-typing",
      handleWebSocketUserTyping as EventListener
    );
    window.addEventListener(
      "websocket-user-stopped-typing",
      handleWebSocketUserStopTyping as EventListener
    );
    window.addEventListener(
      "websocket-message-read",
      handleWebSocketMessageRead as EventListener
    );

    return () => {
      if (currentSessionId) {
        leaveRoom(`session:${currentSessionId}`);
        if (userId) {
          websocketService.leaveConversation(currentSessionId, userId);
        }
      }
      window.removeEventListener(
        "websocket-new-message",
        handleWebSocketNewMessage as EventListener
      );
      window.removeEventListener(
        "websocket-user-typing",
        handleWebSocketUserTyping as EventListener
      );
      window.removeEventListener(
        "websocket-user-stopped-typing",
        handleWebSocketUserStopTyping as EventListener
      );
      window.removeEventListener(
        "websocket-message-read",
        handleWebSocketMessageRead as EventListener
      );
    };
  }, [
    isConnected,
    currentSessionId,
    selectedContact,
    userId,
    joinRoom,
    leaveRoom,
  ]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Reset search and load all contacts
  const resetSearch = useCallback(() => {
    setIsSearching(false);
    loadContacts();
  }, [loadContacts]);

  // Typing functionality
  const startTyping = useCallback(() => {
    if (currentSessionId && userId && !isTyping) {
      setIsTyping(true);
      websocketService.setTyping(currentSessionId, userId, true);
    }
  }, [currentSessionId, userId, isTyping]);

  const stopTyping = useCallback(() => {
    if (currentSessionId && userId && isTyping) {
      setIsTyping(false);
      websocketService.stopTyping(currentSessionId, userId);
    }
  }, [currentSessionId, userId, isTyping]);

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: number) => {
      try {
        await apiClient.markMessageAsRead(messageId);
        if (userId) {
          websocketService.markMessageAsRead(messageId, userId);
        }
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    },
    [userId]
  );

  // Get conversation history
  const loadConversationHistory = useCallback(
    (limit?: number, offset?: number) => {
      if (currentSessionId && userId) {
        websocketService.getConversationHistory(
          currentSessionId,
          userId,
          limit,
          offset
        );
      }
    },
    [currentSessionId, userId]
  );

  return {
    contacts,
    messages,
    selectedContact,
    isLoading: isLoading || isSearching,
    error,
    isConnected,
    isSearching,
    isTyping,
    typingUsers: Array.from(typingUsers),
    selectContact,
    sendMessage,
    searchContacts,
    searchAllUsers,
    loadContacts,
    resetSearch,
    startTyping,
    stopTyping,
    markAsRead,
    loadConversationHistory,
    clearError: () => setError(null),
  };
}
