"use client";

import { messagesApi } from "@/lib/api/modules/messages";
import { useApiOperation } from "@/hooks/api/useApiOperation";

export function useMessagesApi() {
  const listThreads = useApiOperation(messagesApi.listThreads);
  const getThread = useApiOperation(messagesApi.getThread);
  const createDirectThread = useApiOperation(messagesApi.createDirectThread);
  const listMessages = useApiOperation(messagesApi.listMessages);
  const sendMessage = useApiOperation(messagesApi.sendMessage);
  const markThreadAsRead = useApiOperation(messagesApi.markThreadAsRead);

  return {
    listThreads,
    getThread,
    createDirectThread,
    listMessages,
    sendMessage,
    markThreadAsRead,
  };
}
