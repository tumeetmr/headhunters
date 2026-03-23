import { get, patch, post } from "@/lib/api";

export interface MessageThreadItem {
  id: string;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  recruiterProfile: {
    id: string;
    slug?: string | null;
    photoUrl?: string | null;
    title?: string | null;
    user?: {
      id: string;
      name?: string | null;
    } | null;
  } | null;
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    sender: {
      id: string;
      name?: string | null;
    };
  } | null;
}

export interface MessageThreadDetail {
  id: string;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  recruiterProfile: {
    id: string;
    slug?: string | null;
    photoUrl?: string | null;
    title?: string | null;
    user?: {
      id: string;
      name?: string | null;
    } | null;
  } | null;
}

export interface MessageItem {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  sender: {
    id: string;
    name?: string | null;
    role?: string;
  };
}

export const messagesApi = {
  listThreads() {
    return get<MessageThreadItem[]>("/messages/threads");
  },

  getThread(threadId: string) {
    return get<MessageThreadDetail>(`/messages/threads/${threadId}`);
  },

  createDirectThread(input: {
    recruiterProfileId?: string;
    companyId?: string;
    subject?: string;
    initialMessage?: string;
  }) {
    return post<MessageThreadDetail>("/messages/threads/direct", input);
  },

  listMessages(threadId: string) {
    return get<MessageItem[]>(`/messages/threads/${threadId}/messages`);
  },

  sendMessage(threadId: string, body: string) {
    return post<MessageItem>(`/messages/threads/${threadId}/messages`, { body });
  },

  markThreadAsRead(threadId: string) {
    return patch<{ success: boolean; readAt: string }>(`/messages/threads/${threadId}/read`);
  },
};
