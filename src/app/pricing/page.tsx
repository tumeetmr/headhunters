'use client';

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { get } from "@/lib/api";

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  currency: string;
  interval: string;
  features?: Record<string, any>;
  isActive: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const planFeatures: Record<string, string[]> = {
    'Starter': [
      'Basic profile visibility',
      'Up to 5 proposals per month',
      'Up to 2 active contracts',
      'Platform fee: 15%',
    ],
    'Pro': [
      'Full profile + Pro badge',
      'Unlimited proposals',
      'Up to 10 active contracts',
      'Platform fee: 10%',
      'Advanced analytics',
    ],
    'Elite': [
      'Featured profile listing',
      'Unlimited proposals',
      'Unlimited active contracts',
      'Platform fee: 6%',
      'Advanced analytics + priority support',
    ],
  };

  // Sort plans: middle one is featured
  const sortedPlans = plans.sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
    return priceA - priceB;
  });

  const enhancedPlans = sortedPlans.map((plan, index) => ({
    ...plan,
    featured: index === 1 && sortedPlans.length === 3,
    badge: index === 1 && sortedPlans.length === 3 ? 'Average' : undefined,
  }));

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-slate-600">Loading pricing plans...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-red-600">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Our pricing plan</h1>
        <p className="mt-4 text-lg text-slate-600">Explore our flexible plans and get started today!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
        {enhancedPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative transition-all duration-300 ${
              plan.featured
                ? "border-slate-700 bg-slate-800 text-white shadow-xl md:scale-105"
                : "border-slate-200 bg-white"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 right-8">
                <Badge className="bg-emerald-400 text-slate-900 font-semibold px-4 py-1.5 text-sm rounded-full">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className={plan.featured ? "text-white" : "text-slate-950"}>
                {plan.name}
              </CardTitle>
              <p className={`mt-2 text-sm ${plan.featured ? "text-slate-300" : "text-slate-600"}`}>
                {plan.description || 'Flexible subscription plan'}
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className={`text-4xl font-black ${plan.featured ? "text-white" : "text-slate-950"}`}>
                  ₮{plan.price}
                </span>
                <span className={`text-sm ${plan.featured ? "text-slate-400" : "text-slate-600"}`}>
                  / {plan.interval.toLowerCase()}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {(planFeatures[plan.name] || []).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        plan.featured ? "text-emerald-400" : "text-emerald-500"
                      }`}
                    />
                    <span className={`text-sm ${plan.featured ? "text-slate-200" : "text-slate-700"}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full py-6 text-base font-semibold transition-all gap-2 rounded-lg ${
                  plan.featured
                    ? "bg-white text-slate-900 hover:bg-slate-50"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Try for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 rounded-lg border border-slate-200 bg-slate-50 p-8">
        <h3 className="text-lg font-bold text-slate-950">What's included in every plan?</h3>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            "Direct access to companies",
            "No middlemen or retainer fees",
            "Real-time notifications",
            "Contract management tools",
            "Payment processing",
            "24/7 support",
          ].map((item, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-500" />
              <span className="text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
