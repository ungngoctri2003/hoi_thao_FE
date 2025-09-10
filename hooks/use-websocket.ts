import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000",
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const socket = io(url, {
      path: "/ws",
      auth: token ? { token } : {},
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      onConnect?.();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      onDisconnect?.();
    });

    socket.on("connect_error", (err) => {
      setError(err);
      onError?.(err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect]); // Remove callback dependencies to prevent re-creation

  const connect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  };

  const emit = (event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const joinRoom = (room: string) => {
    emit("join", room);
  };

  const leaveRoom = (room: string) => {
    emit("leave", room);
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
}
