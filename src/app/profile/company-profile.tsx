"use client";

import { useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MapPin,
  PenSquare,
  LogOut,
  User,
  CreditCard,
  Calendar,
  Activity,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CompanyManager from "@/components/profile/company-manager";
import SkillsManager from "@/components/profile/skills-manager";
import { type UserProfile } from "@/lib/profile-api";
import { get } from "@/lib/api";
import { fetchRequests } from "@/lib/forms-api";
import { fetchJobProposals } from "@/lib/proposals-api";

type CompanyPlanFeatures = {
  max_active_projects: number;
  max_proposals_viewable: number;
  can_direct_message: boolean;
  can_shortlist: boolean;
  can_post_recruit_request: boolean;
  featured_projects: number;
  dedicated_account_manager: boolean;
  analytics_access: boolean;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number | string;
  currency: string;
  interval: string;
  features?: CompanyPlanFeatures;
};

type SubscriptionPayment = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  createdAt: string;
};

type CompanySubscription = {
  id: string;
  companyId: string;
  planId: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
  payments?: SubscriptionPayment[];
};

type JobSummary = {
  id: string;
  status: string;
};

type UsageSnapshot = {
  activeProjects: number;
  viewableProposals: number;
  requestsPosted: number;
};

function asPriceNumber(value: number | string) {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number | string, currency: string) {
  const numeric = asPriceNumber(value);
  return `${new Intl.NumberFormat("en-US").format(numeric)} ${currency}`;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-CA");
}

function getNextBillingDate(subscription: CompanySubscription) {
  if (subscription.status !== "ACTIVE") {
    return subscription.endDate ?? null;
  }

  const succeededPayment = subscription.payments?.find(
    (payment) => payment.status === "SUCCEEDED"
  );
  const anchor = new Date(succeededPayment?.createdAt ?? subscription.startDate);

  if (Number.isNaN(anchor.getTime())) {
    return null;
  }

  const next = new Date(anchor);
  const interval = subscription.plan.interval.toUpperCase();
  if (interval === "YEARLY") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

function computeUsagePercent(used: number, limit: number) {
  if (limit < 0) return 0;
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

interface CompanyProfileProps {
  user: UserProfile;
  onProfileUpdated: () => Promise<void>;
}

export default function CompanyProfile({ user, onProfileUpdated }: CompanyProfileProps) {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [usage, setUsage] = useState<UsageSnapshot>({
    activeProjects: 0,
    viewableProposals: 0,
    requestsPosted: 0,
  });
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const company = user.company!;

  useEffect(() => {
    let isMounted = true;

    async function loadSubscriptionAndUsage() {
      try {
        setIsSubscriptionLoading(true);
        setSubscriptionError(null);

        const [subscriptionData, jobs, requests] = await Promise.all([
          get<CompanySubscription>("/subscriptions/me"),
          get<JobSummary[]>(`/job-openings/company/${company.id}`),
          fetchRequests(),
        ]);

        const activeProjects = jobs.filter(
          (job) => !["FILLED", "CLOSED", "CANCELLED"].includes(job.status)
        ).length;

        const proposalGroups = await Promise.all(
          jobs.map((job) => fetchJobProposals(job.id).catch(() => []))
        );
        const proposalsCount = proposalGroups.flat().length;

        if (!isMounted) return;
        setSubscription(subscriptionData);
        setUsage({
          activeProjects,
          viewableProposals: proposalsCount,
          requestsPosted: requests.length,
        });
      } catch (error) {
        if (!isMounted) return;
        setSubscriptionError(
          error instanceof Error ? error.message : "Failed to load subscription data"
        );
      } finally {
        if (isMounted) {
          setIsSubscriptionLoading(false);
        }
      }
    }

    void loadSubscriptionAndUsage();

    return () => {
      isMounted = false;
    };
  }, [company.id]);

  const features = subscription?.plan.features;
  const activeProjectLimit = features?.max_active_projects ?? 0;
  const proposalsLimit = features?.max_proposals_viewable ?? 0;
  const activeProjectUsagePercent = computeUsagePercent(usage.activeProjects, activeProjectLimit);
  const proposalsUsagePercent = computeUsagePercent(usage.viewableProposals, proposalsLimit);
  const latestPayment = subscription?.payments?.[0];
  const nextBillingDate = subscription ? getNextBillingDate(subscription) : null;

  const handleProfileUpdated = async () => {
    setIsEditProfileOpen(false);
    await onProfileUpdated();
  };

  const handleSkillsUpdated = async () => {
    setIsSkillsDialogOpen(false);
    await onProfileUpdated();
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-72 shrink-0 space-y-4 md:space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-lg md:rounded-[24px] p-4 md:p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-base md:text-lg text-slate-900 mb-4 md:mb-6">Details</h2>

            <div className="space-y-3 md:space-y-5">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Size</span>
                <p className="text-sm font-medium text-slate-900">
                  {company?.size || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Location</span>
                <p className="text-sm font-medium text-slate-900 wrap-break-word">
                  {company?.location || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Industry</span>
                <p className="text-sm font-medium text-slate-900">
                  {company?.industry || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 md:mb-2 block">Website</span>
                {company?.website ? (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline break-all"
                  >
                    {company.website}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-slate-900">—</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-4 md:space-y-6">
          
          {/* HEADER ROW */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Company Main Card */}
            <div className="bg-white rounded-lg md:rounded-[24px] p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 md:gap-6 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-6 flex-1 min-w-0">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl md:rounded-[32px] overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {(() => {
                    const imgUrl = company?.logoUrl;
                    if (imgUrl) {
                      return (
                        <Image
                          src={imgUrl}
                          alt={company.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('fallback-icon-active');
                          }}
                        />
                      );
                    }
                    return <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />;
                  })()}
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hidden absolute fallback-icon" />
                  <style jsx>{`
                    .fallback-icon-active .fallback-icon {
                      display: block;
                    }
                  `}</style>
                </div>
                
                <div className="text-center sm:text-left space-y-1 md:space-y-2 flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 wrap-break-word">
                    {company?.name}
                  </h1>
                  
                  <div className="flex flex-col sm:flex-col gap-2 text-sm text-slate-600">
                    <span className="flex items-center justify-center sm:justify-start gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="break-all">{user.email}</span>
                    </span>
                    {company?.location && (
                      <span className="flex items-center justify-center sm:justify-start gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="wrap-break-word">{company?.location}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">
                    Joined: {new Date(user.createdAt).toLocaleDateString("en-CA")} &nbsp;|&nbsp; Lambda ID: {user.id.split('-')[0]}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
                <Button 
                  onClick={() => setIsEditProfileOpen(true)}
                  variant="outline" 
                  className="rounded-full gap-2 font-medium border-slate-200 text-xs sm:text-sm px-3 sm:px-4"
                >
                  <PenSquare className="w-4 h-4" />
                  <span className="hidden xs:inline">Edit</span>
                </Button>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="ghost"
                  className="rounded-full gap-2 font-medium text-slate-600 hover:text-slate-900 text-xs sm:text-sm px-3 sm:px-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* ABOUT SECTION */}
          <div className="bg-white rounded-lg md:rounded-[24px] p-4 md:p-6 shadow-sm border border-slate-100 space-y-3 md:space-y-4">
            <h2 className="font-bold text-base md:text-lg text-slate-900">About Company</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {company?.description || "No description added yet."}
            </p>
          </div>

          {/* COMPANY SKILLS SECTION */}
          <div className="bg-white rounded-lg md:rounded-[24px] p-4 md:p-6 shadow-sm border border-slate-100 space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
              <h2 className="font-bold text-base md:text-lg text-slate-900">Company Skills & Focus</h2>
              <Button
                onClick={() => setIsSkillsDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 rounded-full text-xs sm:text-sm px-3 sm:px-4 w-full sm:w-auto"
              >
                <PenSquare className="w-4 h-4" />
                Edit
              </Button>
            </div>
            {company.tags && company.tags.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {Object.entries(
                  company.tags.reduce((acc, tag) => {
                    const type = tag.skill.type || "Other";
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(tag);
                    return acc;
                  }, {} as Record<string, typeof company.tags>)
                ).map(([type, tags]) => (
                  <div key={type}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{type}</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span key={tag.id} className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {tag.skill.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills added yet.</p>
            )}
          </div>

          {/* SUBSCRIPTION & USAGE */}
          <div className="bg-white rounded-lg md:rounded-[24px] p-4 md:p-6 shadow-sm border border-slate-100 space-y-4 md:space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-base md:text-lg text-slate-900">Subscription & Usage</h2>
                <p className="text-xs sm:text-sm text-slate-500">Track plan limits, billing dates, and current usage.</p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/pricing">Manage Plan</Link>
              </Button>
            </div>

            {isSubscriptionLoading ? (
              <p className="text-sm text-slate-500">Loading subscription details...</p>
            ) : subscriptionError ? (
              <p className="text-sm text-red-600">{subscriptionError}</p>
            ) : !subscription ? (
              <p className="text-sm text-slate-500">No subscription found for this company yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
                      <CreditCard className="w-3.5 h-3.5" />
                      Current Plan
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{subscription.plan.name}</p>
                    <p className="text-xs text-slate-600">
                      {formatMoney(subscription.plan.price, subscription.plan.currency)} / {subscription.plan.interval.toLowerCase()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      Last Payment
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(latestPayment?.createdAt)}</p>
                    <p className="text-xs text-slate-600">
                      {latestPayment
                        ? `${formatMoney(latestPayment.amount, latestPayment.currency)} (${latestPayment.status})`
                        : "No payment record"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      Next Billing
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(nextBillingDate)}</p>
                    <p className="text-xs text-slate-600">
                      {subscription.cancelAtPeriodEnd ? "Will cancel at period end" : "Auto-renews"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5" />
                      Subscription Status
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{subscription.status}</p>
                    <p className="text-xs text-slate-600">Started: {formatDate(subscription.startDate)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">Active Projects</span>
                      <span className="text-slate-600">
                        {usage.activeProjects} / {activeProjectLimit === -1 ? "Unlimited" : activeProjectLimit}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: activeProjectLimit === -1 ? "40%" : `${activeProjectUsagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">Viewable Proposals</span>
                      <span className="text-slate-600">
                        {usage.viewableProposals} / {proposalsLimit === -1 ? "Unlimited" : proposalsLimit}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-sky-500 transition-all"
                        style={{ width: proposalsLimit === -1 ? "40%" : `${proposalsUsagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    Recruit requests posted: <span className="font-semibold text-slate-700">{usage.requestsPosted}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Company Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Company Profile</DialogTitle>
          </DialogHeader>
          <CompanyManager 
            profile={company} 
            onClose={() => setIsEditProfileOpen(false)} 
            onSuccess={handleProfileUpdated} 
          />
        </DialogContent>
      </Dialog>

      {/* Skills Dialog */}
      <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Skills</DialogTitle>
          </DialogHeader>
          <SkillsManager
            companyId={company.id}
            currentSkills={(company.tags || []).map((tag) => tag.skill)}
            isEditing={true}
            onSave={handleSkillsUpdated}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
