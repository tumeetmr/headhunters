"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchRequests, type RecruitRequest } from "@/lib/forms-api";
import {
  updateRequestStatus,
  submitCounterProposal,
  resolveCounterProposal,
} from "@/lib/forms-api";
import { Button } from "@/components/ui/button";
import {
  NotificationsCards,
  type Notification,
} from "@/components/dashboard/notifications-cards";
import { type ShortlistedRecruiter } from "@/components/dashboard/shortlist-cards";
import { RequestCard } from "@/components/dashboard/request-card";
import { ShortlistCard } from "@/components/dashboard/shortlist-card";
import { ProposalCard, formatProposalStatus, proposalStatusClass } from "@/components/dashboard/proposal-card";
import { RequestDetailDialog } from "@/components/requests/request-detail-dialog";
import {
  acceptProposal,
  fetchJobProposals,
  rejectProposal,
  type Proposal,
} from "@/lib/proposals-api";
import {
  fetchCompanyEngagements,
  updateEngagement,
  type Engagement,
} from "@/lib/engagements-api";
import {
  fetchPlacementsByEngagement,
  selectPlacementCandidate,
  type Placement,
} from "@/lib/placements-api";
import { profileApi, type CompanyShortlistItem } from "@/lib/profile-api";
import { get, put } from "@/lib/api";
import { messagesApi, type MessageThreadItem } from "@/lib/messages-api";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type CompanyTab = "all" | "requests" | "proposals" | "engagements" | "messages" | "shortlist";

type JobSummary = {
  id: string;
  title: string;
};

function mapThreadsToNotifications(threads: MessageThreadItem[]): Notification[] {
  return threads
    .filter((thread) => thread.lastMessage)
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .map((thread) => {
      const partnerName = thread.recruiterProfile?.user?.name || "Recruiter";
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

function mapShortlistItem(item: CompanyShortlistItem): ShortlistedRecruiter {
  return {
    id: item.id,
    recruiterProfileId: item.recruiterProfileId,
    recruiterId: item.recruiterProfileId,
    note: item.note,
    createdAt: item.createdAt,
    recruiter: {
      id: item.recruiterProfile.id,
      title: item.recruiterProfile.title,
      slug: item.recruiterProfile.slug,
      yearsExperience: item.recruiterProfile.yearsExperience,
      rating: item.recruiterProfile.rating,
      location: item.recruiterProfile.location,
      photoUrl: item.recruiterProfile.photoUrl,
      user: item.recruiterProfile.user,
    },
  };
}

export function CompanyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<CompanyTab>("all");
  const [requests, setRequests] = useState<RecruitRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [shortlist, setShortlist] = useState<ShortlistedRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RecruitRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [proposalActionLoadingId, setProposalActionLoadingId] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [engagementPlacements, setEngagementPlacements] = useState<Placement[]>([]);
  const [engagementDataLoading, setEngagementDataLoading] = useState(false);
  const [placementSelectionLoadingId, setPlacementSelectionLoadingId] = useState<string | null>(null);
  const [closeoutLoading, setCloseoutLoading] = useState<"FILLED" | "CLOSED" | null>(null);
  const [placementMessage, setPlacementMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const tabFromUrl = searchParams.get("tab");
  const requestIdFromUrl = searchParams.get("requestId");

  useEffect(() => {
    if (tabFromUrl === "all" || tabFromUrl === "requests" || tabFromUrl === "proposals" || tabFromUrl === "engagements" || tabFromUrl === "messages" || tabFromUrl === "shortlist") {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (!requestIdFromUrl || requests.length === 0) {
      return;
    }

    const matchingRequest = requests.find((request) => request.id === requestIdFromUrl);
    if (!matchingRequest) {
      return;
    }

    setActiveTab("requests");
    setSelectedRequest(matchingRequest);
  }, [requestIdFromUrl, requests]);

  const patchProposal = (updated: Proposal) => {
    setProposals((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const runProposalAction = async (proposalId: string, action: "accept" | "reject") => {
    try {
      setProposalActionLoadingId(proposalId);
      setError(null);

      const updated =
        action === "accept"
          ? await acceptProposal(proposalId)
          : await rejectProposal(proposalId);

      patchProposal(updated);
      setSelectedProposal((prev) => (prev?.id === updated.id ? updated : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed proposal action");
    } finally {
      setProposalActionLoadingId(null);
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requestData = await fetchRequests();
      setRequests(requestData);

      const profile = await profileApi.getUserProfile();
      const companyId = profile.company?.id;

      if (!companyId) {
        setProposals([]);
        setEngagements([]);
        setShortlist([]);
        return;
      }

      const [jobs, shortlistData, threads, companyEngagements] = await Promise.all([
        get<JobSummary[]>(`/job-openings/company/${companyId}`),
        profileApi.getCompanyShortlist(),
        messagesApi.listThreads(),
        fetchCompanyEngagements(companyId),
      ]);

      setShortlist(shortlistData.map(mapShortlistItem));
      setNotifications(mapThreadsToNotifications(threads));
      setEngagements(companyEngagements);

      if (!jobs.length) {
        setProposals([]);
        return;
      }

      const proposalGroups = await Promise.all(jobs.map((job) => fetchJobProposals(job.id)));
      setProposals(proposalGroups.flat());
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

  const handleRequestClick = (request: RecruitRequest) => {
    setSelectedRequest(request);
  };

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

  const handleRemoveFromShortlist = async (id: string) => {
    try {
      setError(null);
      await profileApi.removeCompanyShortlistItem(id);
      setShortlist((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove shortlist item");
    }
  };

  const handleMessageRecruiter = (request: RecruitRequest) => {
    if (request.recruiter?.id) {
      // Navigate to messages with the recruiter pre-selected
      router.push(`/messages?recruiterId=${request.recruiter.id}`);
    }
  };

  const handleNavigateToRecruiter = (recruiterSlug: string) => {
    router.push(`/recruiters/${recruiterSlug}`);
  };

  const handleOpenEngagement = async (engagement: Engagement) => {
    setSelectedEngagement(engagement);
    setEngagementDataLoading(true);
    setPlacementMessage(null);
    try {
      const placements = await fetchPlacementsByEngagement(engagement.id);
      setEngagementPlacements(placements);
    } catch (err) {
      setPlacementMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load placements",
      });
      setEngagementPlacements([]);
    } finally {
      setEngagementDataLoading(false);
    }
  };

  const handleSelectPlacement = async (placementId: string) => {
    try {
      setPlacementSelectionLoadingId(placementId);
      setPlacementMessage(null);

      const selected = await selectPlacementCandidate(placementId);
      setEngagementPlacements((prev) =>
        prev.map((placement) => {
          if (placement.id === selected.id) {
            return selected;
          }

          if (
            placement.status === "PENDING" ||
            placement.status === "OFFERED" ||
            placement.status === "ACCEPTED"
          ) {
            return { ...placement, status: "CANCELLED" };
          }

          return placement;
        })
      );

      setPlacementMessage({
        type: "success",
        text: "Candidate selected. Other pending candidates were cancelled.",
      });
    } catch (err) {
      setPlacementMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to select candidate",
      });
    } finally {
      setPlacementSelectionLoadingId(null);
    }
  };

  const patchEngagement = (updated: Engagement) => {
    setEngagements((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
    setSelectedEngagement((prev) =>
      prev?.id === updated.id ? { ...prev, ...updated } : prev
    );
  };

  const handleCloseoutEngagement = async (status: "FILLED" | "CLOSED") => {
    if (!selectedEngagement) return;

    if (status === "FILLED") {
      const hasStartedOrGuaranteedPlacement = engagementPlacements.some(
        (placement) => placement.status === "STARTED" || placement.status === "GUARANTEED"
      );

      if (!hasStartedOrGuaranteedPlacement) {
        setPlacementMessage({
          type: "error",
          text: "At least one placement must be STARTED or GUARANTEED before marking engagement FILLED.",
        });
        return;
      }
    }

    try {
      setCloseoutLoading(status);
      setPlacementMessage(null);

      if (status === "FILLED") {
        if (!selectedEngagement.jobOpeningId) {
          setPlacementMessage({
            type: "error",
            text: "Linked job opening not found for this engagement.",
          });
          return;
        }

        const [updatedEngagement] = await Promise.all([
          updateEngagement(selectedEngagement.id, { status: "FILLED" }),
          put(`/job-openings/${selectedEngagement.jobOpeningId}`, {
            status: "FILLED",
          }),
        ]);

        patchEngagement(updatedEngagement);
        setPlacementMessage({
          type: "success",
          text: "Engagement marked FILLED and job opening updated to FILLED.",
        });
      } else {
        const updatedEngagement = await updateEngagement(selectedEngagement.id, {
          status: "CLOSED",
        });
        patchEngagement(updatedEngagement);
        setPlacementMessage({
          type: "success",
          text: "Engagement marked CLOSED.",
        });
      }
    } catch (err) {
      setPlacementMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to close out engagement",
      });
    } finally {
      setCloseoutLoading(null);
    }
  };

  const patchRequest = (updated: RecruitRequest) => {
    setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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

  const tabs: Array<{ id: CompanyTab; label: string; icon: React.ReactNode; count: number }> = [
    {
      id: "all",
      label: "All Items",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        </svg>
      ),
      count: requests.length + proposalCount + unreadNotifications.length + shortlist.length,
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
      count: engagements.length,
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
    {
      id: "shortlist",
      label: "Shortlist",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      count: shortlist.length,
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
                {activeTab === "shortlist" && "Shortlist"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {activeTab === "all" &&
                  "Overview of your requests, messages, and shortlisted recruiters"}
                {activeTab === "requests" && "Track requests sent to recruiters"}
                {activeTab === "proposals" &&
                  "Review recruiter proposals for your openings"}
                {activeTab === "engagements" &&
                  "Manage accepted proposals and candidate placement progress"}
                {activeTab === "messages" && "Stay updated with notifications"}
                {activeTab === "shortlist" && "Your saved list of top recruiters"}
              </p>
            </div>

            <div className="mb-4 block lg:hidden">
              <h2 className="text-xl font-semibold text-slate-900">
                {activeTab === "all" && "Dashboard"}
                {activeTab === "requests" && "All Requests"}
                {activeTab === "proposals" && "Proposals"}
                {activeTab === "engagements" && "Engagements"}
                {activeTab === "messages" && "Messages"}
                {activeTab === "shortlist" && "Shortlist"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {activeTab === "all" && "Overview of your activity"}
                {activeTab === "requests" && "Manage your requests"}
                {activeTab === "proposals" && "Track proposal activity"}
                {activeTab === "engagements" && "Track accepted hiring engagements"}
                {activeTab === "messages" && "Latest notifications"}
                {activeTab === "shortlist" && "Your top recruiters"}
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
                            <RequestCard
                              request={request}
                              role="COMPANY"
                              onClick={() => handleRequestClick(request)}
                              onMessage={() => handleMessageRecruiter(request)}
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
                            onClick={() => setSelectedProposal(proposal)}
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
                              Recruiter: {engagement.recruiterProfile?.user?.name || "Unknown recruiter"}
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

                  {shortlist.length > 0 && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Top Shortlisted ({shortlist.length})
                      </h2>
                      <div className="space-y-3">
                        {shortlist.slice(0, 3).map((item, i) => (
                          <div
                            key={item.id}
                            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${i * 50}ms` }}
                          >
                            <ShortlistCard 
                              item={item} 
                              onRemove={handleRemoveFromShortlist}
                              onClick={() => handleNavigateToRecruiter(item.recruiter.slug)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {requests.length === 0 &&
                    proposals.length === 0 &&
                    notifications.length === 0 &&
                    shortlist.length === 0 && (
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
                        <RequestCard
                          request={request}
                          role="COMPANY"
                          onClick={() => handleRequestClick(request)}
                          onMessage={() => handleMessageRecruiter(request)}
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
                              onClick={() => setSelectedProposal(proposal)}
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
                              Recruiter: {engagement.recruiterProfile?.user?.name || "Unknown recruiter"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              Linked Proposal: {engagement.applicationId || "N/A"}
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

              {activeTab === "shortlist" && (
                <div className="space-y-3">
                  {shortlist.length === 0 ? (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12">
                      <p className="text-sm text-slate-600">No shortlisted recruiters</p>
                    </div>
                  ) : (
                    shortlist.map((item, i) => (
                      <div
                        key={item.id}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <ShortlistCard 
                          item={item} 
                          onRemove={handleRemoveFromShortlist}
                          onClick={() => handleNavigateToRecruiter(item.recruiter.id)}
                        />
                      </div>
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
          role="COMPANY"
          loading={actionLoading}
          onAccept={() => handleSimpleStatus(selectedRequest.id, "ACCEPTED")}
          onDecline={() => handleSimpleStatus(selectedRequest.id, "DECLINED")}
          onSendCounter={(message) => handleCounterProposal(selectedRequest.id, message)}
          onAcceptCounter={() => handleResolveCounter(selectedRequest.id, "ACCEPTED")}
          onDeclineCounter={() => handleResolveCounter(selectedRequest.id, "DECLINED")}
        />
      )}

      <Dialog
        open={!!selectedProposal}
        onOpenChange={(open) => {
          if (!open) setSelectedProposal(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Proposal</DialogTitle>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-5">
              {/* Job Section */}
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Job</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedProposal.jobOpening?.title || "Untitled Job"}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${
                      proposalStatusClass(selectedProposal.status)
                    }`}
                  >
                    {formatProposalStatus(selectedProposal.status)}
                  </span>
                  <span className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                    Submitted {new Date(selectedProposal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </section>

              {/* Recruiter Section */}
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Recruiter</p>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-slate-900">
                      {selectedProposal.recruiterProfile?.user?.name || "Unknown recruiter"}
                    </p>
                    {selectedProposal.recruiterProfile?.title && (
                      <p className="mt-1 text-sm text-slate-600">{selectedProposal.recruiterProfile.title}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-600">
                      {selectedProposal.recruiterProfile?.user?.email || "No email provided"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedProposal.recruiterProfile?.yearsExperience && (
                        <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                          {selectedProposal.recruiterProfile.yearsExperience}+ years
                        </span>
                      )}
                      {selectedProposal.recruiterProfile?.rating && selectedProposal.recruiterProfile.rating > 0 && (
                        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                          ⭐ {selectedProposal.recruiterProfile.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Pitch Section */}
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Pitch</p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedProposal.pitch?.trim() || "No pitch provided."}
                </p>
              </section>

              {/* Delivery Section */}
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Delivery Timeline</p>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedProposal.estimatedDays
                    ? `${selectedProposal.estimatedDays} day(s)`
                    : "Not specified"}
                </p>
              </section>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <Button
                  onClick={() => handleNavigateToRecruiter(selectedProposal.recruiterProfile?.slug || selectedProposal.recruiterProfile?.id || "")}
                  variant="outline"
                  className="flex-1"
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => {
                    if (selectedProposal.recruiterProfile?.id) {
                      router.push(`/messages?recruiterId=${selectedProposal.recruiterProfile.id}`);
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Message
                </Button>
                {selectedProposal.status === "PENDING" && (
                  <>
                    <Button
                      onClick={() => void runProposalAction(selectedProposal.id, "accept")}
                      disabled={proposalActionLoadingId === selectedProposal.id}
                      className="flex-1"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => void runProposalAction(selectedProposal.id, "reject")}
                      disabled={proposalActionLoadingId === selectedProposal.id}
                      variant="outline"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </>
                )}

                {selectedProposal.status === "ACCEPTED" && (
                  <Button
                    onClick={() => {
                      const linkedEngagement = engagements.find(
                        (engagement) => engagement.applicationId === selectedProposal.id
                      );
                      if (linkedEngagement) {
                        setSelectedProposal(null);
                        void handleOpenEngagement(linkedEngagement);
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Open Linked Engagement
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <DialogTitle>Engagement Details</DialogTitle>
          </DialogHeader>

          {selectedEngagement && (
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedEngagement.jobOpening?.title || "Untitled Role"}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {selectedEngagement.status}
                  </span>
                  <span className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                    Linked Proposal: {selectedEngagement.applicationId || "N/A"}
                  </span>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Engagement Timeline
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    Proposal Accepted
                  </div>
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    Engagement Active
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                    Candidate Progress Tracking
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Candidate Submission Workflow
                </p>
                <p className="text-sm text-slate-600">
                  Recruiters submit candidate placements for this engagement. Review candidates below and select one to move forward.
                </p>
                {placementMessage && (
                  <p
                    className={`mt-3 text-xs ${
                      placementMessage.type === "success" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {placementMessage.text}
                  </p>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Placement Status
                </p>
                {engagementDataLoading ? (
                  <p className="text-sm text-slate-600">Loading placements...</p>
                ) : engagementPlacements.length === 0 ? (
                  <p className="text-sm text-slate-600">No placements yet.</p>
                ) : (
                  <div className="space-y-2">
                    {engagementPlacements.map((placement) => (
                      <div
                        key={placement.id}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-slate-900">{placement.candidateName}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          Status: <span className="font-semibold">{placement.status}</span>
                        </p>
                        {placement.candidateEmail && (
                          <p className="mt-1 text-xs text-slate-600">Email: {placement.candidateEmail}</p>
                        )}
                        {placement.candidateLinkedin && (
                          <p className="mt-1 text-xs text-slate-600">LinkedIn: {placement.candidateLinkedin}</p>
                        )}

                        {(placement.status === "PENDING" || placement.status === "OFFERED") && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              onClick={() => void handleSelectPlacement(placement.id)}
                              disabled={placementSelectionLoadingId === placement.id}
                            >
                              {placementSelectionLoadingId === placement.id
                                ? "Selecting..."
                                : "Select Candidate"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Closeout Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => void handleCloseoutEngagement("FILLED")}
                    disabled={closeoutLoading !== null}
                  >
                    {closeoutLoading === "FILLED"
                      ? "Finalizing..."
                      : "Mark FILLED + Job FILLED"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void handleCloseoutEngagement("CLOSED")}
                    disabled={closeoutLoading !== null}
                  >
                    {closeoutLoading === "CLOSED" ? "Closing..." : "Mark CLOSED"}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Validation: FILLED requires at least one STARTED or GUARANTEED placement.
                </p>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
