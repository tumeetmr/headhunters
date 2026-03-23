"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Copy,
  Users,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationsCardsProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead?: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const notificationIcons: Record<string, React.ReactNode> = {
  RECRUIT_REQUEST_RECEIVED: <Copy className="h-5 w-5" />,
  RECRUIT_REQUEST_UPDATED: <AlertCircle className="h-5 w-5" />,
  APPLICATION_RECEIVED: <Copy className="h-5 w-5" />,
  APPLICATION_ACCEPTED: <CheckCircle2 className="h-5 w-5" />,
  APPLICATION_REJECTED: <AlertCircle className="h-5 w-5" />,
  ENGAGEMENT_STARTED: <Users className="h-5 w-5" />,
  PLACEMENT_OFFERED: <Trophy className="h-5 w-5" />,
  NEW_MESSAGE: <MessageSquare className="h-5 w-5" />,
};

const notificationColors: Record<string, string> = {
  RECRUIT_REQUEST_RECEIVED: "bg-blue-50 text-blue-600 border-blue-100",
  RECRUIT_REQUEST_UPDATED: "bg-yellow-50 text-yellow-600 border-yellow-100",
  APPLICATION_ACCEPTED: "bg-green-50 text-green-600 border-green-100",
  APPLICATION_REJECTED: "bg-red-50 text-red-600 border-red-100",
  ENGAGEMENT_STARTED: "bg-purple-50 text-purple-600 border-purple-100",
  PLACEMENT_OFFERED: "bg-orange-50 text-orange-600 border-orange-100",
  NEW_MESSAGE: "bg-indigo-50 text-indigo-600 border-indigo-100",
};

function prettyDate(input?: string | null) {
  if (!input) return "Just now";
  const date = new Date(input);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      return "Just now";
    }
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function NotificationsCards({
  notifications,
  loading,
  onMarkAsRead,
  onAction,
}: NotificationsCardsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
        <div className="mb-4 rounded-full bg-slate-100 p-3">
          <Bell className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No notifications yet</h3>
        <p className="mt-1 text-sm text-slate-600">
          You'll receive notifications for requests, messages, and updates here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const colorClass = notificationColors[notification.type] || "bg-slate-50 text-slate-600 border-slate-100";
        const isUnread = !notification.read;

        return (
          <Card
            key={notification.id}
            className={`cursor-pointer border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              isUnread
                ? "border-blue-200 bg-blue-50/70"
                : "border-slate-200/90 bg-white"
            }`}
            onClick={() => {
              if (onMarkAsRead && isUnread) {
                onMarkAsRead(notification.id);
              }
              if (onAction) {
                onAction(notification);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (onMarkAsRead && isUnread) {
                  onMarkAsRead(notification.id);
                }
                if (onAction) {
                  onAction(notification);
                }
              }
            }}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}>
                {notificationIcons[notification.type] || <Bell className="h-5 w-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className={`leading-tight ${isUnread ? "text-slate-900" : "text-slate-800"} text-sm font-semibold`}>
                      {notification.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {notification.message}
                    </p>
                  </div>

                  {isUnread && (
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="text-xs text-slate-500">{prettyDate(notification.createdAt)}</span>
                  {notification.actionLabel && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 rounded-md px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAction) {
                          onAction(notification);
                        }
                      }}
                    >
                      {notification.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
