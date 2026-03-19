'use client';

import { useState, useEffect } from 'react';
import { Check, Minus } from 'lucide-react';
import { get } from "@/lib/api";

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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await get('/subscriptions/plans');
        setPlans((response as any)?.data || response as SubscriptionPlan[]);
      } catch (err) {
        console.error('Failed to fetch subscription plans:', err);
        setError('Failed to load pricing plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const sortedPlans = [...plans]
    .filter((plan) => plan.isActive)
    .sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
    return priceA - priceB;
  });

  const featuredPlanId =
    sortedPlans.find((plan) => plan.name.toUpperCase() === 'PROFESSIONAL')?.id ??
    sortedPlans[Math.floor(sortedPlans.length / 2)]?.id;

  const hasActivePlans = sortedPlans.length > 0;
  const comparisonGridColumns = {
    gridTemplateColumns: `repeat(${sortedPlans.length}, minmax(240px, 1fr))`,
  };
  const activeSelectedPlanId = selectedPlanId ?? featuredPlanId;

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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Compare Plans
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-lg">
          Pick the plan that matches your hiring pace and collaboration needs.
        </p>
      </div>

      {!hasActivePlans ? (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-600 shadow-sm">
          No active plans available right now.
        </div>
      ) : (
        <div className="no-scrollbar overflow-x-auto pb-2">
          <div className="min-w-max" style={comparisonGridColumns}>
            <div className="grid gap-3" style={comparisonGridColumns}>
              {sortedPlans.map((plan) => {
                const planFeatures = plan.features ?? defaultFeatures;
                const isFeatured = plan.id === featuredPlanId;
                const isSelected = plan.id === activeSelectedPlanId;

                return (
                  <article
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedPlanId(plan.id);
                      }
                    }}
                    aria-pressed={isSelected}
                    className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 ${
                      isSelected
                        ? 'border-emerald-400 shadow-emerald-100/70 ring-2 ring-emerald-200'
                        : isFeatured
                          ? 'border-emerald-300 shadow-emerald-100/70'
                          : 'border-slate-200 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <p className="text-lg font-black text-slate-950">{plan.name}</p>
                    <p className="mt-1 min-h-8 text-xs text-slate-500">
                      {plan.description || 'Flexible subscription plan'}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {formatCurrency(plan.currency, plan.price)}
                      <span className="ml-1 text-xs font-medium text-slate-500">
                        / {plan.interval.toLowerCase()}
                      </span>
                    </p>

                    {isFeatured ? (
                      <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Most popular
                      </span>
                    ) : null}

                    <div className="mt-2 text-[11px] font-medium text-slate-500">
                      {isSelected ? 'Selected plan' : 'Click to select'}
                    </div>

                    <div className="mt-4 space-y-0">
                      {featureRows.map((feature) => {
                        const value = planFeatures[feature.key];

                        return (
                          <div
                            key={`${plan.id}-${feature.key}`}
                            className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-xs font-medium text-slate-800 last:border-b-0"
                          >
                            <span className="text-slate-600">{feature.label}</span>
                            <span className="shrink-0">{formatFeatureValue(value, feature.type)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:text-sm">
        Notes: values shown as <span className="font-semibold">Unlimited</span> mean there is no cap.
      </div>
    </main>
  );
}
