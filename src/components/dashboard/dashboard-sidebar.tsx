"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Bell,
  Heart,
  Grid2X2,
  ChevronRight,
} from "lucide-react";

export type DashboardTab = "all" | "requests" | "proposals" | "messages" | "shortlist";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  requestCount?: number;
  proposalCount?: number;
  messageCount?: number;
  shortlistCount?: number;
}

const menuItems: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: "all",
    label: "Overview",
    icon: <Grid2X2 className="h-5 w-5" />,
    description: "All requests and activities",
  },
  {
    id: "requests",
    label: "Requests",
    icon: <ClipboardList className="h-5 w-5" />,
    description: "Incoming or sent requests",
  },
  {
    id: "messages",
    label: "Messages",
    icon: <Bell className="h-5 w-5" />,
    description: "Notifications and messages",
  },
  {
    id: "shortlist",
    label: "Shortlist",
    icon: <Heart className="h-5 w-5" />,
    description: "Your saved recruiters",
  },
];

export default function DashboardSidebar({
  activeTab,
  onTabChange,
  requestCount = 0,
  proposalCount = 0,
  messageCount = 0,
  shortlistCount = 0,
}: DashboardSidebarProps) {
  const badges: Record<DashboardTab, number> = {
    all: requestCount + proposalCount + messageCount + shortlistCount,
    requests: requestCount,
    proposals: proposalCount,
    messages: messageCount,
    shortlist: shortlistCount,
  };

  return (
    <aside className="h-full w-full border-r border-slate-200 bg-white px-4 py-6 sm:w-72">
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Dashboard
        </h2>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const badge = badges[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "group relative w-full rounded-lg px-4 py-3 text-left transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-y-0 left-0 w-1 rounded-r bg-blue-600" />
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center transition-colors",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        isActive ? "text-slate-900" : "text-slate-700"
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>

                {badge > 0 && (
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {badge}
                  </div>
                )}

                {isActive && (
                  <ChevronRight className="h-4 w-4 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="mt-12 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          💡 Tip: Use this menu to organize and manage all your professional activities in one place.
        </p>
      </div>
    </aside>
  );
}
