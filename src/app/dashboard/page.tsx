"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CompanyDashboard } from "./company-dashboard";
import { RecruiterDashboard } from "./recruiter-dashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const role = (session?.user as { role?: string } | undefined)?.role;

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-slate-400" />
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-700">Please log in to access your dashboard.</p>
          <Button asChild className="mt-4">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (role === "COMPANY") {
    return <CompanyDashboard />;
  }

  if (role === "RECRUITER") {
    return <RecruiterDashboard />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-700">Dashboard is not available for your account role.</p>
      </div>
    </main>
  );
}
