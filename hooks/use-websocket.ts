import { useEffect, useRef, useState, useCallback } from "react";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface UseWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  enabled?: boolean;
}

export function useWebSocket({
  url,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
  onOpen,
  onClose,
  onError,
  onMessage,
  enabled = true,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        onClose?.();

        // Attempt to reconnect if we should and haven't exceeded max attempts
        if (
          shouldReconnectRef.current &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        setIsConnecting(false);
        setError("WebSocket connection error");
        onError?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };
    } catch (err) {
      setIsConnecting(false);
      setError("Failed to create WebSocket connection");
    }
  }, [
    url,
    enabled,
    reconnectInterval,
    maxReconnectAttempts,
    onOpen,
    onClose,
    onError,
    onMessage,
  ]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Cannot send message.");
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    lastMessage,
    sendMessage,
    reconnect,
    disconnect,
  };
}

// Dashboard-specific WebSocket hook
export function useDashboardWebSocket() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case "dashboard_update":
        setDashboardData(message.data);
        break;
      case "realtime_update":
        setRealtimeData(message.data);
        break;
      case "checkin_update":
        // Handle check-in updates
        console.log("New check-in:", message.data);
        break;
      case "registration_update":
        // Handle registration updates
        console.log("New registration:", message.data);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }, []);

  const ws = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws",
    onMessage: handleMessage,
    enabled: typeof window !== "undefined", // Only enable on client side
  });

  return {
    ...ws,
    dashboardData,
    realtimeData,
  };
}
