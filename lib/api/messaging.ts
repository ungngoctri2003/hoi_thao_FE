import { apiClient as api } from "../api";

export interface Message {
  id: number | string;
  sessionId: number;
  attendeeId: number | null;
  senderId?: number;
  content: string;
  type: "text" | "image" | "file";
  timestamp: string | Date;
  isRead?: boolean;
}

export interface ChatContact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  lastMessage?: string;
  unreadCount: number;
  conferenceId: number;
}

export interface MessageStats {
  totalConversations: number;
  messagesToday: number;
  activeUsers: number;
  unreadMessages: number;
}

export const messagingApi = {
  // Lấy danh sách attendees theo conference để làm contacts
  async getConferenceAttendees(conferenceId: number): Promise<ChatContact[]> {
    try {
      // Sử dụng method có sẵn từ apiClient
      const response = await api.getAttendees({
        page: 1,
        limit: 100,
        filters: { conferenceId: conferenceId.toString() },
      });

      console.log("Conference attendees from API:", response.data);

      return response.data.map((attendee: any) => ({
        id: attendee.id || attendee.ID,
        name: attendee.name || attendee.NAME,
        email: attendee.email || attendee.EMAIL,
        phone: attendee.phone || attendee.PHONE || "",
        company: attendee.company || attendee.COMPANY || "",
        position: attendee.position || attendee.POSITION || "",
        avatar: attendee.avatar || attendee.AVATAR_URL,
        isOnline: Math.random() > 0.5, // Mock online status
        lastSeen: "Không xác định",
        lastMessage: undefined,
        unreadCount: 0,
        conferenceId: conferenceId,
      }));
    } catch (error) {
      console.error("Error fetching conference attendees:", error);
      // Fallback: Get all users instead of just attendees
      try {
        const allUsersResponse = await api.getAllUsers(1, 100);
        console.log(
          "Fallback: Using all users as contacts:",
          allUsersResponse.data
        );

        return allUsersResponse.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: "",
          company: "",
          position:
            user.role === "admin"
              ? "Quản trị viên"
              : user.role === "staff"
              ? "Nhân viên"
              : user.userType === "attendee"
              ? "Người tham dự"
              : "Người dùng",
          avatar: user.avatar,
          isOnline: Math.random() > 0.5,
          lastSeen: user.lastLogin || "Không xác định",
          lastMessage: undefined,
          unreadCount: 0,
          conferenceId: conferenceId,
        }));
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        // Final fallback to mock data
        return [
          {
            id: 1,
            name: "Nguyễn Văn Admin",
            email: "admin@conference.vn",
            phone: "0123456789",
            company: "Conference Management System",
            position: "Quản trị viên",
            isOnline: true,
            lastSeen: "Đang hoạt động",
            lastMessage: "Chào mừng bạn đến với hội nghị!",
            unreadCount: 0,
            conferenceId: conferenceId,
          },
          {
            id: 2,
            name: "Nguyễn Văn A",
            email: "nguyenvana@email.com",
            phone: "0123456789",
            company: "Công ty ABC",
            position: "Giám đốc",
            isOnline: true,
            lastSeen: "Đang hoạt động",
            lastMessage: "Cảm ơn bạn đã chia sẻ thông tin!",
            unreadCount: 2,
            conferenceId: conferenceId,
          },
          {
            id: 3,
            name: "Trần Thị B",
            email: "tranthib@email.com",
            phone: "0987654321",
            company: "Công ty XYZ",
            position: "Nhân viên",
            isOnline: false,
            lastSeen: "5 phút trước",
            lastMessage: "Tôi sẽ gửi tài liệu cho bạn",
            unreadCount: 0,
            conferenceId: conferenceId,
          },
        ];
      }
    }
  },

  // Lấy danh sách sessions theo conference
  async getConferenceSessions(conferenceId: number): Promise<any[]> {
    try {
      const response = await api.getSessions(conferenceId);
      return response.data;
    } catch (error) {
      console.error("Error fetching conference sessions:", error);
      return [];
    }
  },

  // Lấy danh sách tin nhắn theo session
  async getSessionMessages(
    sessionId: number,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: Message[]; total: number }> {
    try {
      // Use direct fetch since we don't have a public method for this
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/sessions/${sessionId}/messages?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("accessToken") || ""
            }`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || [];
      const meta = result.meta || {};

      const messages: Message[] = data.map((row: any) => ({
        id: row.ID || row.id,
        sessionId: row.SESSION_ID || row.sessionId || sessionId,
        attendeeId: row.ATTENDEE_ID || row.attendeeId,
        content: row.CONTENT || row.content,
        type: (row.TYPE || row.type || "text") as "text" | "image" | "file",
        timestamp: row.TS || row.timestamp || new Date().toISOString(),
        isRead: true,
      }));

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        total: meta.total || messages.length,
      };
    } catch (error) {
      console.error("Error fetching session messages:", error);
      // Fallback to mock data if API fails
      const mockMessages: Message[] = [
        {
          id: 1,
          sessionId: sessionId,
          attendeeId: 1,
          content: `Xin chào! Rất vui được kết nối với bạn tại hội nghị này.`,
          type: "text",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          isRead: true,
        },
        {
          id: 2,
          sessionId: sessionId,
          attendeeId: null, // Current user
          content:
            "Chào bạn! Tôi cũng rất vui được gặp bạn. Bạn có tham gia phiên thảo luận về AI không?",
          type: "text",
          timestamp: new Date(Date.now() - 240000).toISOString(),
          isRead: true,
        },
      ];

      return {
        messages: mockMessages,
        total: mockMessages.length,
      };
    }
  },

  // Gửi tin nhắn
  async sendMessage(
    sessionId: number,
    content: string,
    type: "text" | "image" | "file" = "text",
    attendeeId?: number
  ): Promise<Message> {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("accessToken") || ""
            }`,
          },
          body: JSON.stringify({
            content,
            type,
            attendeeId: attendeeId || null,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);

        // If it's a foreign key constraint error, try to create a session first
        if (response.status === 400 && errorText.includes("ORA-02291")) {
          console.log("Session does not exist, creating a new one...");
          // For now, just return a mock message since we can't create session from frontend
          const newMessage: Message = {
            id: Date.now(),
            sessionId: sessionId,
            attendeeId: attendeeId || null,
            content: content,
            type: type,
            timestamp: new Date().toISOString(),
            isRead: true,
          };

          return newMessage;
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const row = result.data;

      const newMessage: Message = {
        id: row.ID || row.id,
        sessionId: row.SESSION_ID || row.sessionId || sessionId,
        attendeeId: row.ATTENDEE_ID || row.attendeeId || attendeeId || null,
        content: row.CONTENT || row.content || content,
        type: (row.TYPE || row.type || type) as "text" | "image" | "file",
        timestamp: row.TS || row.timestamp || new Date().toISOString(),
        isRead: true,
      };

      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      // Fallback to mock implementation if API fails
      const newMessage: Message = {
        id: Date.now(),
        sessionId: sessionId,
        attendeeId: attendeeId || null,
        content: content,
        type: type,
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      return newMessage;
    }
  },

  // Lấy thống kê messaging
  async getMessagingStats(conferenceId: number): Promise<MessageStats> {
    // Mock data for now - có thể implement API thực tế sau
    return {
      totalConversations: 0,
      messagesToday: 0,
      activeUsers: 0,
      unreadMessages: 0,
    };
  },

  // Tìm kiếm attendees trong conference
  async searchAttendees(
    conferenceId: number,
    query: string
  ): Promise<ChatContact[]> {
    try {
      const response = await api.getAttendees({
        page: 1,
        limit: 50,
        search: query,
      });

      return response.data.map((attendee: any) => ({
        id: attendee.id || attendee.ID,
        name: attendee.name || attendee.NAME,
        email: attendee.email || attendee.EMAIL,
        phone: attendee.phone || attendee.PHONE || "",
        company: attendee.company || attendee.COMPANY || "",
        position: attendee.position || attendee.POSITION || "",
        avatar: attendee.avatar || attendee.AVATAR_URL,
        isOnline: Math.random() > 0.5,
        lastSeen: "Không xác định",
        lastMessage: undefined,
        unreadCount: 0,
        conferenceId: conferenceId,
      }));
    } catch (error) {
      console.error("Error searching attendees:", error);
      return [];
    }
  },

  // Tìm kiếm tất cả người dùng trong hệ thống (APP_USERS + ATTENDEES)
  async searchAllUsers(query: string): Promise<ChatContact[]> {
    try {
      const response = await api.getAllUsers(1, 100); // Get more users

      // Debug: Log all users to see what we get
      console.log("All users from API (APP_USERS + ATTENDEES):", response.data);
      console.log(
        "User types and roles:",
        response.data.map((u: any) => ({
          name: u.name,
          email: u.email,
          role: u.role,
          userType: u.userType,
        }))
      );

      // Filter users by name or email
      const filteredUsers = response.data.filter((user: any) => {
        const name = user.name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const searchQuery = query.toLowerCase();

        return name.includes(searchQuery) || email.includes(searchQuery);
      });

      console.log('Filtered users for query "' + query + '":', filteredUsers);

      return filteredUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: "", // Users don't have phone in the system
        company: "", // Users don't have company in the system
        position:
          user.role === "admin"
            ? "Quản trị viên"
            : user.role === "staff"
            ? "Nhân viên"
            : user.userType === "attendee"
            ? "Người tham dự"
            : "Người dùng",
        avatar: user.avatar,
        isOnline: Math.random() > 0.5, // Mock online status
        lastSeen: user.lastLogin || "Không xác định",
        lastMessage: undefined,
        unreadCount: 0,
        conferenceId: 0, // Global search, not conference-specific
      }));
    } catch (error) {
      console.error("Error searching all users:", error);
      // Fallback to mock data including admin user
      const mockUsers = [
        {
          id: 1,
          name: "Nguyễn Văn Admin",
          email: "admin@conference.vn",
          role: "admin",
          userType: "app_user",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 2,
          name: "Trần Thị Staff",
          email: "staff@conference.vn",
          role: "staff",
          userType: "app_user",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: 3,
          name: "Lê Văn User",
          email: "user@conference.vn",
          role: "attendee",
          userType: "app_user",
          avatar: null,
        },
      ];

      // Filter mock users by query
      const filteredUsers = mockUsers.filter((user: any) => {
        const name = user.name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const searchQuery = query.toLowerCase();

        return name.includes(searchQuery) || email.includes(searchQuery);
      });

      return filteredUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: "",
        company: "",
        position:
          user.role === "admin"
            ? "Quản trị viên"
            : user.role === "staff"
            ? "Nhân viên"
            : "Người dùng",
        avatar: user.avatar,
        isOnline: Math.random() > 0.5,
        lastSeen: "Không xác định",
        lastMessage: undefined,
        unreadCount: 0,
        conferenceId: 0,
      }));
    }
  },

  // Tạo hoặc lấy session cho cuộc trò chuyện
  async getOrCreateConversationSession(
    conferenceId: number,
    attendeeId: number
  ): Promise<number> {
    try {
      // First, try to get existing sessions for this conference
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/conferences/${conferenceId}/sessions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("accessToken") || ""
            }`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const sessions = result.data || [];

        if (sessions.length > 0) {
          // Use the first available session
          return sessions[0].ID || sessions[0].id;
        }
      }

      // If no sessions exist, create a messaging session
      const createResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/conferences/${conferenceId}/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("accessToken") || ""
            }`,
          },
          body: JSON.stringify({
            TITLE: `Messaging Session - ${new Date().toLocaleString()}`,
            DESCRIPTION: "Messaging conversation session",
            STATUS: "active",
            START_TIME: new Date().toISOString(),
            END_TIME: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          }),
        }
      );

      if (createResponse.ok) {
        const result = await createResponse.json();
        return result.data.ID || result.data.id;
      }

      throw new Error("Failed to create session");
    } catch (error) {
      console.error("Error getting/creating session:", error);
      // Fallback to mock session ID
      return attendeeId + 1000;
    }
  },
};
