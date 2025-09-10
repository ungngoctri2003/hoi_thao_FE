"use client";

import {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useMessaging } from "@/hooks/use-messaging";
import { usePermissions } from "@/hooks/use-permissions";
import { apiClient } from "@/lib/api";
import {
  MessageCircle,
  Search,
  Send,
  Users,
  Clock,
  Phone,
  Mail,
  Briefcase,
  Star,
  Heart,
  Share2,
  MoreVertical,
  Paperclip,
  Smile,
  X,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized User Item Component for better performance
const UserItem = memo(
  ({
    user,
    index,
    onAddUser,
  }: {
    user: any;
    index: number;
    onAddUser: (userId: number) => void;
  }) => (
    <div
      key={`${user.id}-${user.email}`}
      className="group flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-top-2"
      style={{
        animationDelay: `${index * 50}ms`,
        animationDuration: "300ms",
        animationFillMode: "both",
      }}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-300 dark:group-hover:ring-blue-600 transition-all duration-200">
          <AvatarImage
            src={user.avatar || "/placeholder.svg"}
            alt={user.name || "User"}
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {(user.name || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
            user.userType === "app_user" ? "bg-green-500" : "bg-blue-500"
          }`}
        ></div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {user.name || "Không có tên"}
          </h3>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              user.role === "admin"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                : user.role === "staff"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {user.role}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
          {user.email || "Không có email"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
              {user.company
                ? `${user.position || "N/A"} tại ${user.company}`
                : user.position || "Thành viên"}
            </p>
            {user.conferenceName ? (
              <p className="text-xs text-blue-600 dark:text-blue-400 truncate font-medium">
                📅 {user.conferenceName}
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                ❌ Chưa tham gia hội nghị
              </p>
            )}
          </div>
          {user.category && user.category !== "all" && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                user.category === "conference"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : user.category === "system"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {user.category === "conference"
                ? "Hội nghị"
                : user.category === "system"
                ? "Hệ thống"
                : "Chưa tham gia"}
            </span>
          )}
        </div>
      </div>

      <Button
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
        onClick={(e) => {
          e.stopPropagation();
          onAddUser(user.id);
        }}
      >
        <Users className="h-4 w-4 mr-2" />
        Thêm
      </Button>
    </div>
  )
);

UserItem.displayName = "UserItem";

interface Message {
  id: string | number;
  senderId?: number;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file";
  isRead: boolean;
}

interface ChatContact {
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

function MessagingPageContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const searchParams = useSearchParams();
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [searchMode, setSearchMode] = useState<"conference" | "global">(
    "global"
  ); // Default to global search
  const [usersWithMessages, setUsersWithMessages] = useState<any[]>([]); // Store users who have sent messages
  const [showAddUserModal, setShowAddUserModal] = useState(false); // Show add user modal
  const [availableUsers, setAvailableUsers] = useState<any[]>([]); // Users available to add to chat
  const [searchUserTerm, setSearchUserTerm] = useState(""); // Search term for adding users
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false); // Loading state for available users
  const [userCategory, setUserCategory] = useState<
    "all" | "conference" | "system" | "non_conference"
  >("all"); // User category filter
  const [conferenceId, setConferenceId] = useState<number | undefined>(
    undefined
  ); // Selected conference ID
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false); // Track if users have been loaded
  const lastProcessedUsersRef = useRef<any[]>([]); // Track last processed users to avoid duplicate processing
  const [usersKey, setUsersKey] = useState(0); // Key to force re-render when needed

  // Get user info for role-based permissions
  const userRole = (user?.role as "admin" | "staff" | "attendee") || "attendee";

  // Debounced search terms
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedSearchUserTerm = useDebounce(searchUserTerm, 300);

  // Use messaging hook - for now using conference ID 1 as default
  // In a real app, this would come from URL params or context
  const {
    contacts,
    messages,
    selectedContact,
    isLoading,
    error,
    isConnected,
    isSearching,
    isTyping,
    typingUsers,
    selectContact,
    sendMessage,
    searchContacts,
    searchAllUsers,
    resetSearch,
    startTyping,
    stopTyping,
    markAsRead,
    clearError,
  } = useMessaging({ conferenceId: 1, userId: user?.id });

  // Load users with messages
  const loadUsersWithMessages = async () => {
    try {
      const response = await apiClient.getUsersWithMessages();
      console.log("📨 Loaded users with messages:", response);
      setUsersWithMessages(response.data || []);
    } catch (error: any) {
      console.error("Error loading users with messages:", error);
      // Show user-friendly error message
      const errorMessage =
        error.message || "Không thể tải danh sách người dùng";
      console.warn("Messaging error:", errorMessage);
      setUsersWithMessages([]);
    }
  };

  // Load available users for adding to chat
  const loadAvailableUsers = useCallback(async () => {
    try {
      setLoadingAvailableUsers(true);
      console.log("Loading available users by category...", {
        userCategory,
        conferenceId,
        userRole,
      });

      let response;
      if (userCategory === "conference") {
        // Use getUsersByConferenceCategory to get all users with conference info
        response = await apiClient.getUsersByConferenceCategory(conferenceId);
        // Filter to show only conference users
        if (response) {
          response = response.data.filter(
            (user: any) => user.category === "conference"
          );
        }
      } else if (userCategory === "all") {
        response = await apiClient.getUsersByConferenceCategory(conferenceId);
      } else {
        response = await apiClient.getUsersByConferenceCategory(conferenceId);
        // Filter by category if not "all"
        if (response) {
          response = response.data.filter(
            (user: any) => user.category === userCategory
          );
        }
      }

      // Apply role-based filtering
      let filteredUsers: any[] = [];
      if (response) {
        // Ensure response is an array
        const users = Array.isArray(response) ? response : response.data || [];

        // Check permissions safely - only check if permissions are loaded
        const isAdmin =
          userRole === "admin" ||
          (hasPermission && hasPermission("roles.manage"));
        const isStaff =
          userRole === "staff" ||
          (hasPermission && hasPermission("attendees.manage"));
        const isAttendee = userRole === "attendee";

        if (isAdmin) {
          // Admin can see all users - no additional filtering needed
          console.log("Admin access - showing all users");
          filteredUsers = users;
        } else if (isStaff) {
          // Staff can only see users in conferences they manage and system users
          filteredUsers = users.filter((user: any) => {
            // Allow system users
            if (user.category === "system") {
              return true;
            }
            // Allow conference users (staff can see users in their managed conferences)
            if (user.category === "conference") {
              return true;
            }
            return false;
          });
          console.log("Staff access - filtered to conference and system users");
        } else if (isAttendee) {
          // Attendee can only see other attendees in the same conference and system users
          filteredUsers = users.filter((user: any) => {
            // Allow system users
            if (user.category === "system") {
              return true;
            }
            // Allow other attendees in the same conference
            if (
              user.category === "conference" &&
              user.userType === "attendee"
            ) {
              return true;
            }
            return false;
          });
          console.log(
            "Attendee access - filtered to other attendees and system users"
          );
        }
      }

      console.log("Available users response:", filteredUsers);
      console.log("Available users count:", filteredUsers?.length || 0);
      console.log("First few users:", filteredUsers?.slice(0, 3));
      setAvailableUsers(filteredUsers || []);
    } catch (error: any) {
      console.error("Error loading available users:", error);
      setAvailableUsers([]);
      // Show error message to user
      alert("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoadingAvailableUsers(false);
    }
  }, [userCategory, conferenceId, userRole]);

  // Handle adding user to chat
  const handleAddUserToChat = async (userId: number) => {
    try {
      // Find the user in available users
      const userToAdd = availableUsers.find((user) => user.id === userId);
      if (!userToAdd) {
        console.error("User not found in available users");
        return;
      }

      // Note: No need to check for existing users here as they are already filtered out
      // in the filteredUsers logic above

      console.log("Adding user to messaging:", userToAdd);

      // Call API to add user to messaging system
      const result = await apiClient.addUserToMessaging(userId);

      if (result.success) {
        // Check if user was actually added or already exists
        if (result.data && result.data.added === false) {
          console.log("User already exists in messaging system");
          alert(
            result.data.message ||
              "Người dùng này đã có trong hệ thống tin nhắn rồi!"
          );
          setShowAddUserModal(false);
          setSearchUserTerm("");
          return;
        }

        // Immediately add user to the local usersWithMessages list
        const newUser = {
          id: userToAdd.id,
          name: userToAdd.name,
          email: userToAdd.email,
          phone: userToAdd.phone || "",
          company: userToAdd.company || "",
          position: userToAdd.position || "",
          avatar: userToAdd.avatar,
          role: userToAdd.role || "attendee",
          userType: userToAdd.userType || "app_user",
          conferenceId: userToAdd.conferenceId || 1,
          conferenceName: userToAdd.conferenceName || "Hội nghị mặc định",
          category: userToAdd.category || "conference",
          messageCount: 0,
          lastMessageTime: "Chưa có tin nhắn",
          isOnline: Math.random() > 0.5,
          lastSeen: "Không xác định",
          lastMessage: undefined,
          unreadCount: 0,
        };

        // Add to the beginning of the list for immediate visibility
        setUsersWithMessages((prev) => [newUser, ...prev]);

        // Close modal and reset search
        setShowAddUserModal(false);
        setSearchUserTerm("");

        console.log(`Successfully added ${userToAdd.name} to messaging`);
      } else {
        console.error("Failed to add user to messaging system");
        alert(
          "Không thể thêm người dùng vào hệ thống tin nhắn. Vui lòng thử lại."
        );
      }
    } catch (error: any) {
      console.error("Error adding user to chat:", error);
      alert("Có lỗi xảy ra khi thêm người dùng. Vui lòng thử lại.");
    }
  };

  // Reset modal state when closing
  const handleCloseModal = () => {
    setShowAddUserModal(false);
    setSearchUserTerm("");
    setAvailableUsers([]);
    setHasLoadedUsers(false);
    lastProcessedUsersRef.current = [];
    setUsersKey(0);
  };

  // Helper function to deduplicate users by email
  const deduplicateUsers = (users: any[]) => {
    console.log("🔍 Deduplicating users:", users.length);
    const uniqueUsers = new Map();
    users.forEach((user, index) => {
      const email = user.email;
      console.log(`Processing user ${index + 1}: ${user.name} (${email})`);

      if (email && !uniqueUsers.has(email)) {
        uniqueUsers.set(email, user);
        console.log(`  ✅ Added to unique users`);
      } else if (email && uniqueUsers.has(email)) {
        console.log(`  ⚠️  Duplicate email found: ${email}`);
        const existing = uniqueUsers.get(email);
        console.log(`  Existing: ${existing.name} (${existing.userType})`);
        console.log(`  Current: ${user.name} (${user.userType})`);

        // If both app_user and attendee exist, keep app_user
        if (existing.userType === "attendee" && user.userType === "app_user") {
          uniqueUsers.set(email, user);
          console.log(`  ✅ Replaced with app_user`);
        } else {
          console.log(`  ❌ Kept existing user`);
        }
      } else {
        console.log(`  ❌ No email found for user: ${user.name}`);
      }
    });

    const result = Array.from(uniqueUsers.values());
    console.log(`🔍 Deduplication result: ${result.length} users`);
    return result;
  };

  // Load users with messages on component mount
  useEffect(() => {
    loadUsersWithMessages();
  }, []);

  // Reload available users when category or conference changes
  useEffect(() => {
    if (showAddUserModal && !hasLoadedUsers) {
      loadAvailableUsers();
      setHasLoadedUsers(true);
    }
  }, [showAddUserModal, hasLoadedUsers, loadAvailableUsers]);

  // Reset hasLoadedUsers when modal closes
  useEffect(() => {
    if (!showAddUserModal) {
      setHasLoadedUsers(false);
    }
  }, [showAddUserModal]);

  // Reload users when category changes or when usersWithMessages changes
  useEffect(() => {
    if (showAddUserModal && hasLoadedUsers) {
      loadAvailableUsers();
    }
  }, [
    userCategory,
    conferenceId,
    showAddUserModal,
    hasLoadedUsers,
    loadAvailableUsers,
    usersWithMessages.length, // Add this to reload when messaging list changes
  ]);

  // Handle search with debounce
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      // If search is empty, reset to show all contacts
      // Only reset if we're currently in search mode
      if (isSearching) {
        resetSearch();
      }
      return;
    }

    if (searchMode === "global") {
      searchAllUsers(debouncedSearchTerm);
    } else {
      searchContacts(debouncedSearchTerm);
    }
  }, [
    debouncedSearchTerm,
    searchMode,
    isSearching,
    resetSearch,
    searchAllUsers,
    searchContacts,
  ]); // Use debouncedSearchTerm instead of searchTerm

  // Always show only users with messages
  const displayContacts = Array.isArray(usersWithMessages)
    ? usersWithMessages
    : [];

  // Memoize processed users to avoid recalculation on every render
  const processedUsers = useMemo(() => {
    if (!availableUsers.length) {
      lastProcessedUsersRef.current = [];
      return [];
    }

    // Check if we already processed the same users
    if (
      lastProcessedUsersRef.current.length === availableUsers.length &&
      lastProcessedUsersRef.current.every(
        (user: any, index: number) =>
          user.id === availableUsers[index]?.id &&
          user.email === availableUsers[index]?.email
      )
    ) {
      return lastProcessedUsersRef.current;
    }

    console.log("🔄 Processing users:", availableUsers.length);

    // First, deduplicate users by email
    const deduplicatedUsers = deduplicateUsers(availableUsers);

    // Include all users (admin, staff, attendee)
    const filteredUsers = deduplicatedUsers;

    // Sort users by conference name, then by user name
    const sortedUsers = filteredUsers.sort((a, b) => {
      // First sort by conference name (put "Chưa tham gia hội nghị" at the end)
      const conferenceA = a.conferenceName || "ZZZ_Chưa tham gia hội nghị";
      const conferenceB = b.conferenceName || "ZZZ_Chưa tham gia hội nghị";
      if (conferenceA !== conferenceB) {
        return conferenceA.localeCompare(conferenceB, "vi-VN");
      }
      // Then sort by user name
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB, "vi-VN");
    });

    // Cache the result
    lastProcessedUsersRef.current = sortedUsers;
    console.log("✅ Processed users cached:", sortedUsers.length);

    return sortedUsers;
  }, [availableUsers]);

  // Reset cache when search term changes rapidly
  useEffect(() => {
    if (showAddUserModal) {
      // Clear cache when search term changes to avoid stale data
      lastProcessedUsersRef.current = [];
      // Only force re-render when search term is cleared (not when typing)
      if (searchUserTerm.trim() === "") {
        setUsersKey((prev) => prev + 1);
      }
    }
  }, [searchUserTerm, showAddUserModal]);

  // Memoize filtered users by search term and exclude existing users
  const filteredUsers = useMemo(() => {
    // If no processed users, return empty array
    if (!processedUsers.length) {
      console.log("🔍 No processed users to filter");
      return [];
    }

    // First filter by search term
    let searchFilteredUsers = processedUsers;
    if (debouncedSearchUserTerm.trim()) {
      searchFilteredUsers = processedUsers.filter(
        (user: any) =>
          (user.name || "")
            .toLowerCase()
            .includes(debouncedSearchUserTerm.toLowerCase()) ||
          (user.email || "")
            .toLowerCase()
            .includes(debouncedSearchUserTerm.toLowerCase()) ||
          (user.conferenceName || "")
            .toLowerCase()
            .includes(debouncedSearchUserTerm.toLowerCase())
      );
    }

    // Then filter out users who are already in the messaging list
    // Convert all IDs to numbers for consistent comparison
    const existingUserIds = new Set(
      usersWithMessages.map((user) => Number(user.id))
    );

    // Debug logging
    console.log("🔍 Filtering users:", {
      totalProcessedUsers: processedUsers.length,
      searchFilteredUsers: searchFilteredUsers.length,
      existingUserIds: Array.from(existingUserIds),
      usersWithMessagesCount: usersWithMessages.length,
      usersWithMessages: usersWithMessages.map((u) => ({
        id: u.id,
        name: u.name,
      })),
    });

    const finalFilteredUsers = searchFilteredUsers.filter((user: any) => {
      const userId = Number(user.id);
      const isExisting = existingUserIds.has(userId);
      console.log(
        `User ${user.name} (ID: ${user.id} -> ${userId}) - isExisting: ${isExisting}`
      );
      return !isExisting;
    });

    console.log("🔍 Final filtered users count:", finalFilteredUsers.length);
    return finalFilteredUsers;
  }, [processedUsers, debouncedSearchUserTerm, usersWithMessages]);

  // Handle user parameter from URL
  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId && contacts.length > 0) {
      const targetContact = contacts.find(
        (contact) => contact.id.toString() === userId
      );
      if (targetContact) {
        handleSelectContact(targetContact);
      }
    }
  }, [searchParams, contacts]);

  const handleSelectContact = (contact: ChatContact) => {
    selectContact(contact);
    setShowChat(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    await sendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle typing indicators
    if (value.trim() && selectedContact) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleInputBlur = () => {
    stopTyping();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Determine available categories based on user role and permissions
  const getAvailableCategories = () => {
    // Check permissions safely - only check if permissions are loaded
    const isAdmin =
      userRole === "admin" || (hasPermission && hasPermission("roles.manage"));
    const isStaff =
      userRole === "staff" ||
      (hasPermission && hasPermission("attendees.manage"));
    const isAttendee = userRole === "attendee";

    const categories = [];

    if (isAdmin) {
      // Admin can access all categories
      categories.push(
        { value: "all", label: "Tất cả" },
        { value: "conference", label: "Hội nghị" },
        { value: "system", label: "Hệ thống" },
        { value: "non_conference", label: "Chưa tham gia" }
      );
    } else if (isStaff || isAttendee) {
      // Staff and Attendee can only access conference and system categories
      categories.push(
        { value: "conference", label: "Hội nghị" },
        { value: "system", label: "Hệ thống" }
      );
    }

    return categories;
  };

  const availableCategories = getAvailableCategories();

  // Set default category based on available categories
  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      !availableCategories.some((cat) => cat.value === userCategory)
    ) {
      setUserCategory(
        availableCategories[0].value as
          | "all"
          | "conference"
          | "system"
          | "non_conference"
      );
    }
  }, [availableCategories, userCategory]);

  // Show loading state while auth or permissions are loading
  if (authLoading || isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                Chưa đăng nhập
              </CardTitle>
              <CardDescription className="text-center">
                Vui lòng đăng nhập để truy cập trang này
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Get user info for MainLayout
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* WebSocket Status - Only show if there's an actual error */}
        {!isConnected && error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800">
                Kết nối WebSocket bị lỗi. Tin nhắn có thể không được đồng bộ
                real-time.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Import websocketService and reset then reconnect
                import("@/lib/websocket").then(({ websocketService }) => {
                  websocketService.reset();
                  websocketService.connect().catch(console.error);
                });
              }}
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              Thử kết nối lại
            </Button>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Tin nhắn</h1>
              <p className="text-muted-foreground">
                Nhắn tin với những người tham dự hội nghị
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                setShowAddUserModal(true);
                loadAvailableUsers();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Thêm người dùng
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ liên hệ
            </Button>
            <Button
              variant={searchMode === "global" ? "default" : "outline"}
              onClick={() =>
                setSearchMode(searchMode === "global" ? "conference" : "global")
              }
            >
              <Search className="h-4 w-4 mr-2" />
              {searchMode === "global"
                ? "Tìm trong hội nghị"
                : "Tìm toàn hệ thống"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Người đã nhắn tin</p>
                  <p className="text-2xl font-bold">{displayContacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Tin nhắn hôm nay</p>
                  <p className="text-2xl font-bold">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Đang hoạt động</p>
                  <p className="text-2xl font-bold">
                    {contacts.filter((c) => c.isOnline).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Chưa đọc</p>
                  <p className="text-2xl font-bold">
                    {contacts.reduce((sum, c) => sum + c.unreadCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Người đã nhắn tin</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={
                      searchMode === "global"
                        ? "Tìm kiếm người dùng toàn hệ thống..."
                        : "Tìm kiếm cuộc trò chuyện..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Badge variant="secondary" className="text-xs">
                        {searchMode === "global" ? "Toàn hệ thống" : "Hội nghị"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {displayContacts.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Chưa có người dùng nào đã nhắn tin
                      </p>
                      <Button
                        onClick={() => {
                          setShowAddUserModal(true);
                          loadAvailableUsers();
                        }}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Thêm người dùng mới
                      </Button>
                    </div>
                  ) : (
                    displayContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center space-x-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedContact?.id === contact.id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleSelectContact(contact)}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage
                              src={contact.avatar || "/placeholder.svg"}
                              alt={contact.name}
                            />
                            <AvatarFallback>
                              {contact.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {contact.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">
                              {contact.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {contact.unreadCount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {contact.unreadCount}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatTime(new Date())}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            Vai trò: {contact.role || "attendee"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Tin nhắn: {contact.messageCount || 0} | Cuối:{" "}
                            {contact.lastMessageTime || "Chưa có"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <Card className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <CardHeader className="flex-shrink-0 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage
                            src={selectedContact.avatar || "/placeholder.svg"}
                            alt={selectedContact.name}
                          />
                          <AvatarFallback>
                            {selectedContact.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedContact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedContact.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {selectedContact.company
                            ? `${selectedContact.position} tại ${selectedContact.company}`
                            : selectedContact.position}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {selectedContact.isOnline
                            ? "Đang hoạt động"
                            : selectedContact.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      // For messaging, we consider a message as "from current user" if senderId matches current user
                      const isCurrentUser = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  isCurrentUser
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatTime(new Date(message.timestamp))}
                              </p>
                              {isCurrentUser && (
                                <div className="flex items-center space-x-1">
                                  {message.isRead ? (
                                    <span className="text-xs text-primary-foreground/70">
                                      ✓✓
                                    </span>
                                  ) : (
                                    <span className="text-xs text-primary-foreground/50">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {typingUsers.length === 1
                                ? "Đang nhập..."
                                : `${typingUsers.length} người đang nhập...`}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Chọn một cuộc trò chuyện
                  </h3>
                  <p className="text-muted-foreground">
                    Chọn một người từ danh sách để bắt đầu trò chuyện
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Messaging Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Mẹo nhắn tin hiệu quả</CardTitle>
            <CardDescription>
              Cách tối ưu hóa trải nghiệm giao tiếp tại hội nghị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Giao tiếp chuyên nghiệp</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Sử dụng ngôn ngữ lịch sự và chuyên nghiệp</li>
                  <li>• Trả lời tin nhắn trong thời gian hợp lý</li>
                  <li>• Chia sẻ thông tin hữu ích và có giá trị</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Tối ưu hóa kết nối</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Đặt câu hỏi mở để khuyến khích thảo luận</li>
                  <li>• Chia sẻ kinh nghiệm và kiến thức</li>
                  <li>• Theo dõi và duy trì mối quan hệ lâu dài</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden mt-8">
              {/* Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Thêm người dùng
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chọn người dùng để thêm vào cuộc trò chuyện
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors rounded-full"
                    onClick={handleCloseModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Category Tabs - Only show categories user has access to */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {availableCategories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() =>
                        setUserCategory(
                          category.value as
                            | "all"
                            | "conference"
                            | "system"
                            | "non_conference"
                        )
                      }
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        userCategory === category.value
                          ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email hoặc hội nghị..."
                    value={searchUserTerm}
                    onChange={(e) => setSearchUserTerm(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl"
                  />
                </div>

                {/* Counter */}
                {!loadingAvailableUsers && processedUsers.length > 0 && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>
                        Hiển thị{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {filteredUsers.length}
                        </span>{" "}
                        / {processedUsers.length} người dùng có thể thêm
                        {usersWithMessages.length > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({usersWithMessages.length} đã có trong danh sách)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Cuộn để xem thêm
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 space-y-2 transition-all duration-300 ease-in-out min-h-[400px]">
                  {loadingAvailableUsers ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Đang tải danh sách
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Vui lòng chờ trong giây lát...
                      </p>
                    </div>
                  ) : (
                    <>
                      {filteredUsers.map((user: any, index: number) => (
                        <UserItem
                          key={`${user.id}-${user.email}`}
                          user={user}
                          index={index}
                          onAddUser={handleAddUserToChat}
                        />
                      ))}
                      {processedUsers.length === 0 &&
                        !loadingAvailableUsers && (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                              Không có người dùng nào khả dụng
                            </p>
                          </div>
                        )}
                      {processedUsers.length > 0 &&
                        filteredUsers.length === 0 && (
                          <div className="text-center py-8">
                            {debouncedSearchUserTerm.trim() ? (
                              <>
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                  Không tìm thấy người dùng nào phù hợp
                                </p>
                              </>
                            ) : (
                              <>
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                  Tất cả người dùng đã có trong danh sách tin
                                  nhắn
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                  Không có người dùng nào mới để thêm
                                </p>
                              </>
                            )}
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function MessagingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <MessagingPageContent />
    </Suspense>
  );
}
