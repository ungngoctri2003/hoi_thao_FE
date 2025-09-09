import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './use-websocket';
import { messagingApi, Message, ChatContact } from '@/lib/api/messaging';

interface UseMessagingOptions {
  conferenceId: number;
  sessionId?: number;
  userId?: number;
}

export function useMessaging({ conferenceId, sessionId, userId }: UseMessagingOptions) {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId || null);

  const { isConnected, joinRoom, leaveRoom, on, off } = useWebSocket({
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onError: (err) => {
      console.warn('WebSocket error (messaging will work without real-time):', err);
      // Don't set error for WebSocket issues, messaging can work without real-time
    }
  });

  // Load contacts (attendees) for the conference
  const loadContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const attendees = await messagingApi.getConferenceAttendees(conferenceId);
      setContacts(attendees);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Không thể tải danh sách liên hệ');
    } finally {
      setIsLoading(false);
    }
  }, [conferenceId]);

  // Load messages for a session
  const loadMessages = useCallback(async (sessionId: number) => {
    try {
      const { messages: sessionMessages } = await messagingApi.getSessionMessages(sessionId);
      setMessages(sessionMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Không thể tải tin nhắn');
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!currentSessionId || !content.trim()) return;

    try {
      const newMessage = await messagingApi.sendMessage(currentSessionId, content, type, selectedContact?.id);
      setMessages(prev => [...prev, newMessage]);
      
      // Update contact's last message
      if (selectedContact) {
        setContacts(prev => prev.map(contact => 
          contact.id === selectedContact.id 
            ? { ...contact, lastMessage: content, unreadCount: 0 }
            : contact
        ));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Không thể gửi tin nhắn');
    }
  }, [currentSessionId, selectedContact]);

  // Select a contact and load their messages
  const selectContact = useCallback(async (contact: ChatContact) => {
    setSelectedContact(contact);
    
    try {
      // Try to get or create a session for this conversation
      const sessionId = await messagingApi.getOrCreateConversationSession(conferenceId, contact.id);
      setCurrentSessionId(sessionId);
      loadMessages(sessionId);
    } catch (error) {
      console.error('Failed to get/create session:', error);
      // Fallback to mock session ID
      const mockSessionId = contact.id + 1000;
      setCurrentSessionId(mockSessionId);
      loadMessages(mockSessionId);
    }
  }, [loadMessages, conferenceId]);

  // Search contacts
  const searchContacts = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Don't reload all contacts, just keep current state
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await messagingApi.searchAttendees(conferenceId, query);
      setContacts(searchResults);
    } catch (err) {
      console.error('Failed to search contacts:', err);
      setError('Không thể tìm kiếm liên hệ');
    } finally {
      setIsSearching(false);
    }
  }, [conferenceId]);

  // Search all users in the system
  const searchAllUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      return;
    }

    try {
      setIsSearching(true);
      const searchResults = await messagingApi.searchAllUsers(query);
      setContacts(searchResults);
    } catch (err) {
      console.error('Failed to search all users:', err);
      setError('Không thể tìm kiếm người dùng');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    // Join session room for real-time messages
    if (currentSessionId) {
      joinRoom(`session:${currentSessionId}`);
    }

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update contact's last message if it's from the selected contact
      if (selectedContact && message.attendeeId === selectedContact.id) {
        setContacts(prev => prev.map(contact => 
          contact.id === selectedContact.id 
            ? { ...contact, lastMessage: message.content }
            : contact
        ));
      }
    };

    on('message', handleNewMessage);

    return () => {
      if (currentSessionId) {
        leaveRoom(`session:${currentSessionId}`);
      }
      off('message', handleNewMessage);
    };
  }, [isConnected, currentSessionId, selectedContact, joinRoom, leaveRoom, on, off]);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Reset search and load all contacts
  const resetSearch = useCallback(() => {
    setIsSearching(false);
    loadContacts();
  }, [loadContacts]);

  return {
    contacts,
    messages,
    selectedContact,
    isLoading: isLoading || isSearching,
    error,
    isConnected,
    selectContact,
    sendMessage,
    searchContacts,
    searchAllUsers,
    loadContacts,
    resetSearch,
    clearError: () => setError(null)
  };
}
