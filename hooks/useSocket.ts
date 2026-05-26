"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/lib/firebase";
import { BASE_URL, MOCK } from "@/lib/config";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (MOCK) return;

    let cancelled = false;
    let socket: Socket;

    async function connect() {
      try {
        const token = await getAuthToken();
        if (cancelled) return;
        socket = io(BASE_URL, {
          auth: { token: token ? `Bearer ${token}` : "" },
          transports: ["websocket", "polling"],
        });

        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));

        socketRef.current = socket;
      } catch {
        if (!cancelled) setError("No se pudo conectar al servidor.");
      }
    }

    connect();

    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, connected, error };
}
