'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, Minus } from 'lucide-react';
import { get, post } from '@/lib/api';
import { profileApi } from '@/lib/profile-api';

interface CompanyPlanFeatures {
  max_active_projects: number;
  max_proposals_viewable: number;
  can_direct_message: boolean;
  can_shortlist: boolean;
  can_post_recruit_request: boolean;
  featured_projects: number;
  dedicated_account_manager: boolean;
  analytics_access: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  currency: string;
  interval: string;
  features?: CompanyPlanFeatures;
  isActive: boolean;
}

interface CompanySubscription {
  id: string;
  companyId: string;
  planId: string;
  status: string;
  plan: SubscriptionPlan;
}

type FeatureKey = keyof CompanyPlanFeatures;

type FeatureRow = {
  key: FeatureKey;
  label: string;
  helper: string;
  type: 'limit' | 'boolean' | 'count';
};

const featureRows: FeatureRow[] = [
  {
    key: 'max_active_projects',
    label: 'Active Projects',
    helper: 'How many projects you can run at the same time',
    type: 'limit',
  },
  {
    key: 'max_proposals_viewable',
    label: 'Viewable Proposals',
    helper: 'How many proposals you can unlock and review',
    type: 'limit',
  },
  {
    key: 'can_direct_message',
    label: 'Direct Messaging',
    helper: 'Message recruiters instantly from the platform',
    type: 'boolean',
  },
  {
    key: 'can_shortlist',
    label: 'Shortlisting',
    helper: 'Save and organize top recruiter candidates',
    type: 'boolean',
  },
  {
    key: 'can_post_recruit_request',
    label: 'Post Recruit Requests',
    helper: 'Create open hiring requests for recruiters',
    type: 'boolean',
  },
  {
    key: 'featured_projects',
    label: 'Featured Projects',
    helper: 'Projects promoted with higher visibility',
    type: 'count',
  },
  {
    key: 'dedicated_account_manager',
    label: 'Dedicated Account Manager',
    helper: 'Priority guidance for hiring strategy and support',
    type: 'boolean',
  },
  {
    key: 'analytics_access',
    label: 'Analytics Access',
    helper: 'Hiring funnel and performance insights',
    type: 'boolean',
  },
];

const defaultFeatures: CompanyPlanFeatures = {
  max_active_projects: 0,
  max_proposals_viewable: 0,
  can_direct_message: false,
  can_shortlist: false,
  can_post_recruit_request: false,
  featured_projects: 0,
  dedicated_account_manager: false,
  analytics_access: false,
};

function formatCurrency(currency: string, price: number | string) {
  const numericPrice = typeof price === 'string' ? Number(price) : price;
  const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0;

  if (currency === 'MNT') {
    return `${new Intl.NumberFormat('en-US').format(safePrice)} MNT`;
  }

  return `${new Intl.NumberFormat('en-US').format(safePrice)} ${currency}`;
}

function formatFeatureValue(value: number | boolean, type: FeatureRow['type']) {
  if (type === 'boolean') {
    const enabled = Boolean(value);
    return enabled ? (
      <span className="inline-flex items-center gap-1.5 text-emerald-600">
        <Check className="h-4 w-4" />
        Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-slate-400">
        <Minus className="h-4 w-4" />
        No
      </span>
    );
  }

  if (type === 'limit') {
    return value === -1 ? 'Unlimited' : String(value);
  }

  return String(value);
}

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CompanySubscription | null>(null);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await get<SubscriptionPlan[]>('/subscriptions/plans');
        const activePlans = Array.isArray(response)
          ? response.filter((plan) => plan.isActive)
          : [];
        setPlans(activePlans);

        if (status === 'authenticated' && session?.user?.role === 'COMPANY') {
          const profile = await profileApi.getUserProfile();
          setCompanyId(profile.company?.id ?? null);

          try {
            const subscription = await get<CompanySubscription>('/subscriptions/me');
            setCurrentSubscription(subscription);
          } catch {
            setCurrentSubscription(null);
          }
        } else {
          setCompanyId(null);
          setCurrentSubscription(null);
        }
      } catch (err) {
        console.error('Failed to fetch subscription plans:', err);
        setError('Failed to load pricing plans');
      } finally {
        setLoading(false);
      }
    };

    void fetchPlans();
  }, [session?.user?.role, status]);

  const handlePlanChange = async (planId: string) => {
    if (status === 'unauthenticated') {
      router.push('/register');
      return;
    }

    if (!companyId || session?.user?.role !== 'COMPANY') {
      return;
    }

    setUpdatingPlanId(planId);
    setActionMessage(null);
    setActionError(null);

    try {
      const updated = await post<CompanySubscription>(`/subscriptions/company/${companyId}`, {
        planId,
      });

      setCurrentSubscription(updated);
      setActionMessage(`Your subscription is now on ${updated.plan.name}.`);
    } catch (err) {
      console.error('Failed to update subscription plan:', err);
      setActionError('Failed to update subscription plan. Please try again.');
    } finally {
      setUpdatingPlanId(null);
    }
  };

  const getPriceNumber = (price: number | string) => {
    const value = typeof price === 'string' ? Number(price) : price;
    return Number.isFinite(value) ? value : 0;
  };

  const sortedPlans = [...plans]
    .sort((a, b) => {
      const priceA = getPriceNumber(a.price);
      const priceB = getPriceNumber(b.price);
      return priceA - priceB;
    });

  const currentPlanId = currentSubscription?.planId ?? null;
  const currentPlanPrice = currentSubscription ? getPriceNumber(currentSubscription.plan.price) : null;
  const isRecruiter = session?.user?.role === 'RECRUITER';
  const isCompany = session?.user?.role === 'COMPANY';

  const featuredPlanId =
    sortedPlans.find((plan) => plan.name.toUpperCase() === 'PROFESSIONAL')?.id ??
    sortedPlans[Math.floor(sortedPlans.length / 2)]?.id;

  const hasActivePlans = sortedPlans.length > 0;

  if (status === 'loading') {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-slate-600">Loading pricing plans...</div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-slate-600">Loading pricing plans...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-96 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
          <div className="text-red-600">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Choose Your Plan
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Select the plan that fits your hiring needs
        </p>
      </div>

      {isRecruiter && (
        <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-800">
          Subscription plans are for company accounts. Recruiter accounts do not have company billing access.
        </div>
      )}

      {isCompany && currentSubscription && (
        <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm text-emerald-800">
          Current plan: <span className="font-semibold">{currentSubscription.plan.name}</span>
        </div>
      )}

      {actionMessage && (
        <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm text-emerald-800">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
          {actionError}
        </div>
      )}

      {!hasActivePlans ? (
        <div className="mx-auto flex max-w-2xl items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-600">
          No active plans available
        </div>
      ) : (
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Plans Grid */}
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(sortedPlans.length, 3)}, 1fr)` }}>
            {sortedPlans.map((plan) => {
              const isFeatured = plan.id === featuredPlanId;
              const planFeatures = plan.features ?? defaultFeatures;
              const isCurrentPlan = currentPlanId === plan.id;
              const planPrice = getPriceNumber(plan.price);
              const isUpgrade = currentPlanPrice !== null ? planPrice > currentPlanPrice : false;
              const isDowngrade = currentPlanPrice !== null ? planPrice < currentPlanPrice : false;
              const canChangePlan = Boolean(isCompany && companyId) || status === 'unauthenticated';
              const isUpdatingThisPlan = updatingPlanId === plan.id;

              let buttonText = 'Choose Plan';
              if (isCurrentPlan && isCompany) {
                buttonText = 'Current Plan';
              } else if (isUpgrade) {
                buttonText = 'Upgrade';
              } else if (isDowngrade) {
                buttonText = 'Downgrade';
              } else if (isCompany && canChangePlan) {
                buttonText = 'Switch Plan';
              }

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-8 transition-all ${
                    isFeatured
                      ? 'border-emerald-500 bg-linear-to-br from-emerald-50 to-white shadow-lg ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-white hover:shadow-lg'
                  }`}
                >
                  {isFeatured && (
                    <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1">
                      <span className="text-xs font-semibold text-emerald-700">★ Most Popular</span>
                    </div>
                  )}

                  <h3 className="text-xl font-black text-slate-950">{plan.name}</h3>
                  {plan.description && (
                    <p className="mt-1 text-xs text-slate-600">{plan.description}</p>
                  )}

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-950">
                      {formatCurrency(plan.currency, plan.price).split(' ')[0]}
                    </span>
                    <span className="text-sm text-slate-600">
                      {plan.currency} / {plan.interval.toLowerCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={isCurrentPlan || Boolean(isUpdatingThisPlan)}
                    className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                      isCurrentPlan
                        ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                        : isFeatured
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'border border-slate-300 bg-white text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    {isUpdatingThisPlan ? 'Updating...' : buttonText}
                  </button>

                  <div className="mt-8 space-y-3 border-t border-slate-200 pt-8">
                    {featureRows.map((feature) => {
                      const value = planFeatures[feature.key];

                      return (
                        <div key={feature.key} className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{feature.label}</p>
                            <p className="text-xs text-slate-500">{feature.helper}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            {formatFeatureValue(value, feature.type)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Need a custom plan?</span> Contact our sales team for enterprise solutions.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
