import { io, type Socket } from "socket.io-client";
import type { MessageItem } from "@/lib/messages-api";

export interface RealtimeMessageItem extends Omit<MessageItem, "createdAt" | "readAt"> {
  createdAt: string | Date;
  readAt?: string | Date | null;
}

export interface MessageNewEvent {
  threadId: string;
  message: RealtimeMessageItem;
}

export function createMessagesSocket(accessToken: string): Socket {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_URL for realtime messages");
  }

  return io(`${apiBaseUrl}/messages`, {
    auth: {
      token: `Bearer ${accessToken}`,
    },
    withCredentials: true,
    transports: ["websocket"],
  });
}
