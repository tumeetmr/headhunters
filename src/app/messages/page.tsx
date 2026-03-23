"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, MessageSquare, Send, Loader2 } from "lucide-react";
import { messagesApi, type MessageItem, type MessageThreadDetail, type MessageThreadItem } from "@/lib/messages-api";
import { createMessagesSocket, type MessageNewEvent, type RealtimeMessageItem } from "@/lib/messages-socket";

type Banner = { type: "error" | "info"; text: string } | null;

const toTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const toDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const getThreadActivityTime = (thread: MessageThreadItem) =>
  new Date(thread.lastMessage?.createdAt ?? thread.updatedAt).getTime();

const sortMessagesByCreatedAt = (items: MessageItem[]) =>
  [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

function MessagesPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const recruiterProfileId = searchParams.get("recruiterId") ?? undefined;
  const recruiterName = searchParams.get("name") ?? undefined;
  const initialThreadId = searchParams.get("threadId") ?? undefined;

  const [threads, setThreads] = useState<MessageThreadItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<MessageThreadDetail | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [banner, setBanner] = useState<Banner>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [showThreadListOnMobile, setShowThreadListOnMobile] = useState(true);

  const socketRef = useRef<ReturnType<typeof createMessagesSocket> | null>(null);
  const selectedThreadIdRef = useRef<string | null>(null);
  const myUserIdRef = useRef<string | undefined>(session?.user?.id);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const myUserId = session?.user?.id;

  const selectedThreadListItem = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  );

  const sortedThreads = useMemo(
    () =>
      [...threads].sort(
        (a, b) => getThreadActivityTime(b) - getThreadActivityTime(a),
      ),
    [threads],
  );

  const normalizeIncomingMessage = useCallback(
    (message: RealtimeMessageItem): MessageItem => ({
      ...message,
      createdAt: new Date(message.createdAt).toISOString(),
      readAt: message.readAt ? new Date(message.readAt).toISOString() : message.readAt ?? null,
    }),
    [],
  );

  const loadThreads = useCallback(async () => {
    setIsLoadingThreads(true);
    try {
      const response = await messagesApi.listThreads();
      const sorted = [...response].sort(
        (a, b) => getThreadActivityTime(b) - getThreadActivityTime(a),
      );
      setThreads(sorted);

      if (!selectedThreadId && sorted.length > 0) {
        setSelectedThreadId(sorted[0].id);
      }
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Failed to load message threads.";
      setBanner({ type: "error", text: errorText });
    } finally {
      setIsLoadingThreads(false);
    }
  }, [selectedThreadId]);

  const applyIncomingMessage = useCallback(
    (incoming: RealtimeMessageItem) => {
      const normalized = normalizeIncomingMessage(incoming);
      const activeThreadId = selectedThreadIdRef.current;
      const currentUserId = myUserIdRef.current;

      if (normalized.threadId === activeThreadId) {
        setMessages((prev) => {
          if (prev.some((item) => item.id === normalized.id)) {
            return prev;
          }

          return sortMessagesByCreatedAt([...prev, normalized]);
        });
      }

      let didUpdateExistingThread = false;
      setThreads((prev) => {
        const targetIndex = prev.findIndex((thread) => thread.id === normalized.threadId);
        if (targetIndex < 0) {
          return prev;
        }

        didUpdateExistingThread = true;

        const target = prev[targetIndex];
        const shouldIncrementUnread =
          normalized.senderId !== currentUserId && normalized.threadId !== activeThreadId;

        const updatedTarget: MessageThreadItem = {
          ...target,
          updatedAt: normalized.createdAt,
          unreadCount: shouldIncrementUnread ? target.unreadCount + 1 : target.unreadCount,
          lastMessage: {
            id: normalized.id,
            body: normalized.body,
            createdAt: normalized.createdAt,
            sender: {
              id: normalized.sender.id,
              name: normalized.sender.name,
            },
          },
        };

        const rest = prev.filter((thread) => thread.id !== normalized.threadId);
        return [updatedTarget, ...rest];
      });

      if (!didUpdateExistingThread) {
        void loadThreads();
      }
    },
    [loadThreads, normalizeIncomingMessage],
  );

  const ensureDirectThread = useCallback(async () => {
    if (!recruiterProfileId || session?.user?.role !== "COMPANY") return;

    setIsCreatingThread(true);
    try {
      const thread = await messagesApi.createDirectThread({ recruiterProfileId });
      setSelectedThreadId(thread.id);
      router.replace("/messages");
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Failed to create conversation.";
      setBanner({ type: "error", text: errorText });
    } finally {
      setIsCreatingThread(false);
    }
  }, [recruiterProfileId, router, session?.user?.role]);

  const loadMessages = useCallback(async (threadId: string) => {
    setIsLoadingMessages(true);
    try {
      const [threadDetail, threadMessages] = await Promise.all([
        messagesApi.getThread(threadId),
        messagesApi.listMessages(threadId),
      ]);

      setSelectedThread(threadDetail);
      setMessages(sortMessagesByCreatedAt(threadMessages));
      await messagesApi.markThreadAsRead(threadId);

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
        ),
      );
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Failed to load messages.";
      setBanner({ type: "error", text: errorText });
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const handleDraftFocus = useCallback(async () => {
    if (!selectedThreadId || !selectedThreadListItem || selectedThreadListItem.unreadCount <= 0) {
      return;
    }

    try {
      await messagesApi.markThreadAsRead(selectedThreadId);
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === selectedThreadId ? { ...thread, unreadCount: 0 } : thread,
        ),
      );
    } catch {
      // Keep focus behavior silent to avoid interrupting message composition.
    }
  }, [selectedThreadId, selectedThreadListItem]);

  const handleSend = useCallback(async () => {
    if (!selectedThreadId || !draft.trim()) return;

    setIsSending(true);
    try {
      const created = await messagesApi.sendMessage(selectedThreadId, draft.trim());
      setMessages((prev) => {
        if (prev.some((message) => message.id === created.id)) {
          return prev;
        }

        return sortMessagesByCreatedAt([...prev, created]);
      });
      setDraft("");

      setThreads((prev) =>
        prev.reduce<MessageThreadItem[]>((acc, thread) => {
          if (thread.id === selectedThreadId) {
            const updatedThread: MessageThreadItem = {
              ...thread,
              updatedAt: created.createdAt,
              lastMessage: {
                id: created.id,
                body: created.body,
                createdAt: created.createdAt,
                sender: {
                  id: created.sender.id,
                  name: created.sender.name,
                },
              },
            };

            return [updatedThread, ...acc];
          }

          acc.push(thread);
          return acc;
        }, []),
      );
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Failed to send message.";
      setBanner({ type: "error", text: errorText });
    } finally {
      setIsSending(false);
    }
  }, [draft, selectedThreadId]);

  const handleDraftKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
        return;
      }

      event.preventDefault();

      if (isSending || !draft.trim()) {
        return;
      }

      void handleSend();
    },
    [draft, handleSend, isSending],
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    void loadThreads();
  }, [loadThreads, status]);

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
  }, [selectedThreadId]);

  useEffect(() => {
    myUserIdRef.current = myUserId;
  }, [myUserId]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) {
      return;
    }

    let socket: ReturnType<typeof createMessagesSocket>;
    try {
      socket = createMessagesSocket(session.accessToken);
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Failed to initialize realtime messaging.";
      setBanner({ type: "error", text: errorText });
      return;
    }

    socketRef.current = socket;

    const handleConnect = () => {
      setIsSocketConnected(true);
      const currentThreadId = selectedThreadIdRef.current;
      if (currentThreadId) {
        socket.emit("thread:join", { threadId: currentThreadId });
      }
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleConnectError = (error: Error) => {
      setBanner({ type: "error", text: error.message || "Realtime connection failed." });
    };

    const handleMessageEvent = (payload: MessageNewEvent) => {
      applyIncomingMessage(payload.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("messages:new", handleMessageEvent);
    socket.on("threads:updated", handleMessageEvent);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("messages:new", handleMessageEvent);
      socket.off("threads:updated", handleMessageEvent);
      socket.disconnect();
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [applyIncomingMessage, session?.accessToken, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!recruiterProfileId) return;
    void ensureDirectThread();
  }, [ensureDirectThread, recruiterProfileId, status]);

  useEffect(() => {
    if (!initialThreadId) return;
    setSelectedThreadId(initialThreadId);
  }, [initialThreadId]);

  useEffect(() => {
    if (!selectedThreadId || status !== "authenticated") return;
    void loadMessages(selectedThreadId);
  }, [loadMessages, selectedThreadId, status]);

  useEffect(() => {
    if (!selectedThreadId || !isSocketConnected) return;

    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("thread:join", { threadId: selectedThreadId });

    return () => {
      socket.emit("thread:leave", { threadId: selectedThreadId });
    };
  }, [isSocketConnected, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId || isLoadingMessages) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [isLoadingMessages, messages, selectedThreadId]);

  if (status === "loading") {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-zinc-600 dark:text-zinc-300">Please sign in to access messages.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {recruiterName && isCreatingThread ? (
          <span className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting chat with {recruiterName}
          </span>
        ) : null}
      </div>

      {banner ? (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            banner.type === "error"
              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-900/20 dark:text-red-300"
              : "border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-200"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      <div className="grid h-[calc(100vh-12rem)] min-h-128 grid-cols-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:grid-cols-[320px_1fr]">
        <aside
          className={`flex flex-col border-b border-zinc-200 dark:border-zinc-800 lg:border-b-0 lg:border-r transition-all duration-300 ${showThreadListOnMobile ? "" : "hidden lg:flex"}`}
        >
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <h1 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
              Messages
            </h1>
          </div>

          <div className="h-full overflow-y-auto">
            {isLoadingThreads ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
                ))}
              </div>
            ) : sortedThreads.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
                No conversations yet. Open a recruiter profile and click Message.
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {sortedThreads.map((thread) => {
                  const isActive = thread.id === selectedThreadId;
                  const name =
                    session.user.role === "COMPANY"
                      ? thread.recruiterProfile?.user?.name ?? "Recruiter"
                      : thread.company?.name ?? "Company";

                  return (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedThreadId(thread.id);
                          setShowThreadListOnMobile(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          isActive
                            ? "bg-zinc-100 dark:bg-zinc-900"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {name}
                            </p>
                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {thread.lastMessage?.body ?? thread.subject ?? "New conversation"}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {toTime(thread.updatedAt)}
                            </span>
                            {thread.unreadCount > 0 ? (
                              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-semibold text-white">
                                {thread.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className={`flex min-h-0 flex-col transition-all duration-300 ${showThreadListOnMobile ? "hidden lg:flex" : ""}`}>
          {!selectedThreadId ? (
            <div className="m-auto max-w-md px-6 text-center">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Select a conversation
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Your direct company-recruiter messages will appear here.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowThreadListOnMobile(true)}
                  className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  aria-label="Back to threads"
                >
                  <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </button>
                <div className="flex items-center gap-3 min-w-0">
                  {selectedThreadListItem?.recruiterProfile?.photoUrl ? (
                    <Image
                      src={selectedThreadListItem.recruiterProfile.photoUrl}
                      alt="Avatar"
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {(session.user.role === "COMPANY"
                        ? selectedThread?.recruiterProfile?.user?.name?.charAt(0)
                        : selectedThread?.company?.name?.charAt(0)) ?? "?"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {session.user.role === "COMPANY"
                        ? selectedThread?.recruiterProfile?.user?.name ?? "Recruiter"
                        : selectedThread?.company?.name ?? "Company"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {selectedThread?.subject ?? "Direct message"}
                    </p>
                  </div>
                </div>
              </header>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-zinc-50/70 p-3 sm:p-4 dark:bg-zinc-950">
                {isLoadingMessages ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-12 max-w-lg animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="m-auto max-w-sm rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    Start the conversation with your first message.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isMine = message.senderId === myUserId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-md px-3 sm:px-4 py-2 rounded-2xl text-sm ${
                              isMine
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                : "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                            <p
                              className={`mt-1.5 text-[11px] ${
                                isMine ? "text-zinc-300 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            >
                              {toDateTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <footer className="border-t border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    onFocus={() => void handleDraftFocus()}
                    placeholder="Write a message..."
                    rows={2}
                    className="h-20 sm:h-24 min-h-20 sm:min-h-24 max-h-24 flex-1 resize-none overflow-y-auto rounded-lg sm:rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
                  />

                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={isSending || !draft.trim()}
                    className="inline-flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-primary-text text-white transition-colors hover:bg-primary-text/80 disabled:opacity-60 shrink-0"
                    aria-label="Send message"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
