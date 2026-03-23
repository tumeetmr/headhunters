"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchRequests,
  resolveCounterProposal,
  submitCounterProposal,
  updateRequestStatus,
  type RecruitRequest,
} from "@/lib/forms-api";
import {
  NotificationsCards,
  type Notification,
} from "@/components/dashboard/notifications-cards";
import { FullWidthRequestCard } from "@/components/dashboard/full-width-request-card";
import { RequestDetailDialog } from "@/components/requests/request-detail-dialog";
import { ProposalCard } from "@/components/dashboard/proposal-card";
import { Button } from "@/components/ui/button";
import {
  fetchMyProposals,
  type Proposal,
  withdrawProposal,
} from "@/lib/proposals-api";
import { fetchRecruiterEngagements, type Engagement } from "@/lib/engagements-api";
import {
  createPlacement,
  fetchPlacementsByEngagement,
  updatePlacementStatus,
  type Placement,
  type PlacementStatus,
} from "@/lib/placements-api";
import { messagesApi, type MessageThreadItem } from "@/lib/messages-api";
import { profileApi } from "@/lib/profile-api";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type RecruiterTab = "all" | "requests" | "proposals" | "engagements" | "messages";

function mapThreadsToNotifications(threads: MessageThreadItem[]): Notification[] {
  return threads
    .filter((thread) => thread.lastMessage)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .map((thread) => {
      const partnerName = thread.company?.name || "Company";
      return {
        id: `thread-${thread.id}`,
        type: "NEW_MESSAGE",
        title: `Message from ${partnerName}`,
        message: thread.lastMessage?.body || "You received a new message",
        read: thread.unreadCount === 0,
        createdAt: thread.lastMessage?.createdAt || thread.updatedAt,
        actionLabel: "Open chat",
        metadata: { threadId: thread.id },
      };
    });
}

export function RecruiterDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RecruiterTab>("all");
  const [requests, setRequests] = useState<RecruitRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RecruitRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [proposalActionLoadingId, setProposalActionLoadingId] = useState<string | null>(null);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [engagementPlacements, setEngagementPlacements] = useState<Placement[]>([]);
  const [engagementDataLoading, setEngagementDataLoading] = useState(false);
  const [placementActionLoadingId, setPlacementActionLoadingId] = useState<string | null>(null);
  const [placementSubmitting, setPlacementSubmitting] = useState(false);
  const [placementMessage, setPlacementMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [placementForm, setPlacementForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidateLinkedin: "",
    offeredSalary: "",
    guaranteeDays: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const engagementCount = engagements.length;


  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.read);
  }, [notifications]);

  const groupedProposals = useMemo(() => {
    return proposals.reduce<Record<string, Proposal[]>>((acc, proposal) => {
      const key = proposal.jobOpening?.id || proposal.jobOpeningId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(proposal);
      return acc;
    }, {});
  }, [proposals]);

  const proposalCount = proposals.length;

  const patchRequest = (updated: RecruitRequest) => {
    setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const patchProposal = (updated: Proposal) => {
    setProposals((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [requestData, myProposals, threads] = await Promise.all([
        fetchRequests(),
        fetchMyProposals(),
        messagesApi.listThreads(),
      ]);

      const profile = await profileApi.getUserProfile();
      const recruiterId = profile.recruiterProfile?.id;

      const recruiterEngagements = recruiterId
        ? await fetchRecruiterEngagements(recruiterId)
        : [];

      setRequests(requestData);
      setProposals(myProposals);
      setEngagements(recruiterEngagements);
      setNotifications(mapThreadsToNotifications(threads));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      void messagesApi
        .listThreads()
        .then((threads) => setNotifications(mapThreadsToNotifications(threads)))
        .catch(() => {
          // Keep the last successful notifications snapshot on transient failures.
        });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (id: string) => {
    const target = notifications.find((n) => n.id === id);
    const threadId = typeof target?.metadata?.threadId === "string" ? target.metadata.threadId : null;

    if (threadId) {
      void messagesApi.markThreadAsRead(threadId);
    }

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleNotificationAction = (notification: Notification) => {
    const threadId =
      typeof notification.metadata?.threadId === "string"
        ? notification.metadata.threadId
        : null;

    if (!threadId) return;

    void messagesApi.markThreadAsRead(threadId);
    router.push(`/messages?threadId=${threadId}`);
  };

  const handleRequestClick = (request: RecruitRequest) => {
    setSelectedRequest(request);
  };

  const handleSimpleStatus = async (
    requestId: string,
    nextStatus: "ACCEPTED" | "DECLINED"
  ) => {
    try {
      setActionLoading(true);
      const updated = await updateRequestStatus(requestId, nextStatus);
      patchRequest(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterProposal = async (requestId: string, message: string) => {
    try {
      setActionLoading(true);
      const updated = await submitCounterProposal(requestId, { message });
      patchRequest(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send counter proposal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveCounter = async (
    requestId: string,
    nextStatus: "ACCEPTED" | "DECLINED"
  ) => {
    try {
      setActionLoading(true);
      const updated = await resolveCounterProposal(requestId, nextStatus);
      patchRequest(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve counter proposal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawProposal = async (proposalId: string) => {
    try {
      setProposalActionLoadingId(proposalId);
      setError(null);
      const updated = await withdrawProposal(proposalId);
      patchProposal(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw proposal");
    } finally {
      setProposalActionLoadingId(null);
    }
  };

  const getNextPlacementStatuses = (status: PlacementStatus): PlacementStatus[] => {
    const transitions: Record<PlacementStatus, PlacementStatus[]> = {
      PENDING: ["OFFERED"],
      OFFERED: [],
      ACCEPTED: ["STARTED"],
      STARTED: ["GUARANTEED"],
      GUARANTEED: [],
      CANCELLED: [],
    };

    return transitions[status] || [];
  };

  const handleOpenEngagement = async (engagement: Engagement) => {
    setSelectedEngagement(engagement);
    setEngagementDataLoading(true);
    setPlacementMessage(null);
    try {
      const placements = await fetchPlacementsByEngagement(engagement.id);
      setEngagementPlacements(placements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load placements");
      setEngagementPlacements([]);
    } finally {
      setEngagementDataLoading(false);
    }
  };

  const handleCreatePlacement = async () => {
    if (!selectedEngagement) return;

    if (!placementForm.candidateName.trim()) {
      setPlacementMessage({ type: "error", text: "Candidate name is required." });
      return;
    }

    const offeredSalary = placementForm.offeredSalary.trim()
      ? Number(placementForm.offeredSalary)
      : undefined;
    if (
      offeredSalary !== undefined &&
      (!Number.isFinite(offeredSalary) || offeredSalary <= 0)
    ) {
      setPlacementMessage({
        type: "error",
        text: "Offered salary must be a positive number.",
      });
      return;
    }

    const guaranteeDays = placementForm.guaranteeDays.trim()
      ? Number(placementForm.guaranteeDays)
      : undefined;
    if (
      guaranteeDays !== undefined &&
      (!Number.isFinite(guaranteeDays) || guaranteeDays <= 0)
    ) {
      setPlacementMessage({
        type: "error",
        text: "Guarantee days must be a positive number.",
      });
      return;
    }

    try {
      setPlacementSubmitting(true);
      setPlacementMessage(null);
      const created = await createPlacement({
        engagementId: selectedEngagement.id,
        candidateName: placementForm.candidateName.trim(),
        candidateEmail: placementForm.candidateEmail.trim() || undefined,
        candidateLinkedin: placementForm.candidateLinkedin.trim() || undefined,
        offeredSalary,
        guaranteeDays,
      });

      setEngagementPlacements((prev) => [created, ...prev]);
      setPlacementForm({
        candidateName: "",
        candidateEmail: "",
        candidateLinkedin: "",
        offeredSalary: "",
        guaranteeDays: "",
      });
      setPlacementMessage({ type: "success", text: "Candidate submitted to company." });
    } catch (err) {
      setPlacementMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create placement",
      });
    } finally {
      setPlacementSubmitting(false);
    }
  };

  const handlePlacementStatusUpdate = async (
    placementId: string,
    status: PlacementStatus
  ) => {
    try {
      setPlacementActionLoadingId(placementId);
      setError(null);
      const updated = await updatePlacementStatus(placementId, status);
      setEngagementPlacements((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update placement status");
    } finally {
      setPlacementActionLoadingId(null);
    }
  };

  const tabs: Array<{ id: RecruiterTab; label: string; icon: React.ReactNode; count: number }> = [
    {
      id: "all",
      label: "All Items",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        </svg>
      ),
      count: requests.length + proposalCount + engagementCount + unreadNotifications.length,
    },
    {
      id: "requests",
      label: "Requests",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: requests.length,
    },
    {
      id: "proposals",
      label: "Proposals",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      ),
      count: proposalCount,
    },
    {
      id: "engagements",
      label: "Engagements",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-2 2a4 4 0 005.656 5.656l1-1m-1-9l1-1a4 4 0 115.656 5.656l-2 2a4 4 0 01-5.656 0" />
        </svg>
      ),
      count: engagementCount,
    },
    {
      id: "messages",
      label: "Messages",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      count: unreadNotifications.length,
    },
  ];

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4 lg:items-start">
          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 transform px-4 py-4 transition-transform duration-300 ease-out lg:sticky lg:top-20 lg:z-auto lg:self-start lg:inset-auto lg:w-auto lg:transform-none lg:bg-transparent lg:p-0 ${
              sidebarOpen
                ? "translate-x-0 bg-white shadow-lg"
                : "-translate-x-full bg-white shadow-lg lg:translate-x-0 lg:bg-transparent lg:shadow-none"
            }`}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 rounded-lg border border-slate-200 p-2 transition-colors hover:bg-slate-50 lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mt-8 space-y-1 lg:mt-0 lg:h-fit lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-4">
              <p className="px-2 text-xs font-semibold uppercase tracking-widest text-slate-500 lg:mb-4">
                Categories
              </p>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary-text text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      activeTab === tab.id ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="min-w-0 lg:col-span-3">
            <div className="mb-6 hidden lg:block">
              <h1 className="text-3xl font-bold text-slate-900">
                {activeTab === "all" && "Dashboard"}
                {activeTab === "requests" && "All Requests"}
                {activeTab === "proposals" && "Proposals"}
                {activeTab === "engagements" && "Engagements"}
                {activeTab === "messages" && "Messages"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {activeTab === "all" && "Overview of your requests, proposals, and messages"}
                {activeTab === "requests" && "Manage incoming requests from companies"}
                {activeTab === "proposals" && "Track your submitted proposals and outcomes"}
                {activeTab === "engagements" && "Update candidate progress for active engagements"}
                {activeTab === "messages" && "Stay updated with notifications"}
              </p>
            </div>

            <div className="mb-4 block lg:hidden">
              <h2 className="text-xl font-semibold text-slate-900">
                {activeTab === "all" && "Dashboard"}
                {activeTab === "requests" && "All Requests"}
                {activeTab === "proposals" && "Proposals"}
                {activeTab === "engagements" && "Engagements"}
                {activeTab === "messages" && "Messages"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {activeTab === "all" && "Overview of your activity"}
                {activeTab === "requests" && "Manage your requests"}
                {activeTab === "proposals" && "Track proposal activity"}
                {activeTab === "engagements" && "Move candidate placements forward"}
                {activeTab === "messages" && "Latest notifications"}
              </p>
            </div>

            {error && (
              <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="pr-1 lg:pr-4">
              {activeTab === "all" && (
                <div className="space-y-6">
                  {sortedRequests.length > 0 && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Recent Requests ({sortedRequests.length})
                      </h2>
                      <div className="space-y-3">
                        {sortedRequests.slice(0, 5).map((request, i) => (
                          <div
                            key={request.id}
                            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${i * 50}ms` }}
                          >
                            <FullWidthRequestCard
                              request={request}
                              role="RECRUITER"
                              onClick={() => handleRequestClick(request)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {proposals.length > 0 && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Recent Proposals ({proposals.length})
                      </h2>
                      <div className="space-y-2">
                        {proposals.slice(0, 5).map((proposal) => (
                          <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            variant="recruiter"
                            onWithdraw={() => void handleWithdrawProposal(proposal.id)}
                            onMessage={() => {
                              if (proposal.jobOpening?.company?.id) {
                                router.push(`/messages?companyId=${proposal.jobOpening.company.id}`);
                              }
                            }}
                            loading={proposalActionLoadingId === proposal.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {engagements.length > 0 && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Active Engagements ({engagements.length})
                      </h2>
                      <div className="space-y-2">
                        {engagements.slice(0, 4).map((engagement) => (
                          <button
                            key={engagement.id}
                            onClick={() => void handleOpenEngagement(engagement)}
                            className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {engagement.jobOpening?.title || "Untitled Role"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Company: {engagement.company?.name || "Unknown company"}
                            </p>
                            <p className="mt-2 inline-flex rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                              {engagement.status}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {notifications.length > 0 && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Recent Messages ({unreadNotifications.length} unread)
                      </h2>
                      <NotificationsCards
                        notifications={notifications.slice(0, 4)}
                        loading={false}
                        onMarkAsRead={handleMarkAsRead}
                        onAction={handleNotificationAction}
                      />
                    </div>
                  )}

                  {requests.length === 0 && proposals.length === 0 && notifications.length === 0 && (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
                      <p className="text-sm text-slate-600">No activity yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "requests" && (
                <div className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
                        />
                      ))}
                    </div>
                  ) : sortedRequests.length === 0 ? (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
                      <p className="text-sm text-slate-600">No requests yet</p>
                    </div>
                  ) : (
                    sortedRequests.map((request, i) => (
                      <div
                        key={request.id}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <FullWidthRequestCard
                          request={request}
                          role="RECRUITER"
                          onClick={() => handleRequestClick(request)}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "messages" && (
                <div className="animate-in fade-in duration-300">
                  <NotificationsCards
                    notifications={notifications}
                    loading={false}
                    onMarkAsRead={handleMarkAsRead}
                    onAction={handleNotificationAction}
                  />
                </div>
              )}

              {activeTab === "proposals" && (
                <div className="space-y-6">
                  {proposalCount === 0 ? (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
                      <p className="text-sm text-slate-600">No proposals yet</p>
                    </div>
                  ) : (
                    Object.entries(groupedProposals).map(([jobId, jobProposals]) => (
                      <section key={jobId}>

                        {jobProposals.map((proposal) => {
                          return (
                            <ProposalCard
                              key={proposal.id}
                              proposal={proposal}
                              variant="recruiter"
                              onWithdraw={() => void handleWithdrawProposal(proposal.id)}
                              onMessage={() => {
                                if (proposal.jobOpening?.company?.id) {
                                  router.push(`/messages?companyId=${proposal.jobOpening.company.id}`);
                                }
                              }}
                              loading={proposalActionLoadingId === proposal.id}
                            />
                          );
                        })}
                      </section>
                    ))
                  )}
                </div>
              )}

              {activeTab === "engagements" && (
                <div className="space-y-3">
                  {engagements.length === 0 ? (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
                      <p className="text-sm text-slate-600">No engagements yet</p>
                    </div>
                  ) : (
                    engagements.map((engagement, i) => (
                      <button
                        key={engagement.id}
                        onClick={() => void handleOpenEngagement(engagement)}
                        className="animate-in fade-in slide-in-from-bottom-2 w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition duration-300 hover:border-slate-300"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-slate-900">
                              {engagement.jobOpening?.title || "Untitled Role"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Company: {engagement.company?.name || "Unknown company"}
                            </p>
                          </div>
                          <span className="inline-flex rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {engagement.status}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <RequestDetailDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => {
            if (!open) setSelectedRequest(null);
          }}
          role="RECRUITER"
          loading={actionLoading}
          onAccept={() => handleSimpleStatus(selectedRequest.id, "ACCEPTED")}
          onDecline={() => handleSimpleStatus(selectedRequest.id, "DECLINED")}
          onSendCounter={(message) => handleCounterProposal(selectedRequest.id, message)}
          onAcceptCounter={() => handleResolveCounter(selectedRequest.id, "ACCEPTED")}
          onDeclineCounter={() => handleResolveCounter(selectedRequest.id, "DECLINED")}
        />
      )}

      <Dialog
        open={!!selectedEngagement}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEngagement(null);
            setEngagementPlacements([]);
            setPlacementMessage(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Engagement Placement Progress</DialogTitle>
          </DialogHeader>

          {selectedEngagement && (
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedEngagement.jobOpening?.title || "Untitled Role"}
                </h3>
                <p className="mt-2 text-xs text-slate-600">
                  Company: {selectedEngagement.company?.name || "Unknown company"}
                </p>
                <span className="mt-3 inline-flex rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {selectedEngagement.status}
                </span>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Submit Candidate Placement
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Candidate Name *"
                    value={placementForm.candidateName}
                    onChange={(e) =>
                      setPlacementForm((prev) => ({ ...prev, candidateName: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Candidate Email"
                    value={placementForm.candidateEmail}
                    onChange={(e) =>
                      setPlacementForm((prev) => ({ ...prev, candidateEmail: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={placementForm.candidateLinkedin}
                    onChange={(e) =>
                      setPlacementForm((prev) => ({ ...prev, candidateLinkedin: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Offered Salary"
                    value={placementForm.offeredSalary}
                    onChange={(e) =>
                      setPlacementForm((prev) => ({ ...prev, offeredSalary: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Guarantee Days"
                    value={placementForm.guaranteeDays}
                    onChange={(e) =>
                      setPlacementForm((prev) => ({ ...prev, guaranteeDays: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button onClick={() => void handleCreatePlacement()} disabled={placementSubmitting}>
                    {placementSubmitting ? "Submitting..." : "Submit Candidate"}
                  </Button>
                  {placementMessage && (
                    <p
                      className={`text-xs ${
                        placementMessage.type === "success" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {placementMessage.text}
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Placement Status Flow
                </p>
                <div className="grid gap-2 sm:grid-cols-5">
                  {[
                    "PENDING",
                    "OFFERED",
                    "ACCEPTED",
                    "STARTED",
                    "GUARANTEED",
                  ].map((step) => (
                    <div
                      key={step}
                      className="rounded-md border border-slate-200 bg-white px-2 py-2 text-center text-xs font-medium text-slate-700"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Candidate Placements
                </p>
                {engagementDataLoading ? (
                  <p className="text-sm text-slate-600">Loading placements...</p>
                ) : engagementPlacements.length === 0 ? (
                  <p className="text-sm text-slate-600">No placements created yet. Submit candidates first.</p>
                ) : (
                  <div className="space-y-3">
                    {engagementPlacements.map((placement) => (
                      <div key={placement.id} className="rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {placement.candidateName}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Current Status: <span className="font-semibold">{placement.status}</span>
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {getNextPlacementStatuses(placement.status).map((nextStatus) => (
                              <Button
                                key={nextStatus}
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  void handlePlacementStatusUpdate(placement.id, nextStatus)
                                }
                                disabled={placementActionLoadingId === placement.id}
                              >
                                Mark {nextStatus}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
