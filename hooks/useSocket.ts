"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/lib/firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const MOCK = process.env.NEXT_PUBLIC_MOCK === "true";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (MOCK) return;

    let socket: Socket;

    async function connect() {
      const token = await getAuthToken();
      socket = io(BASE_URL, {
        auth: { token: token ? `Bearer ${token}` : "" },
        transports: ["websocket"],
      });

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      socketRef.current = socket;
    }

    connect();

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, connected };
}
