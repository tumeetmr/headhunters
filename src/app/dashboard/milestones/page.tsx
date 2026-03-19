import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardMilestonesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Milestones</h1>
      <div className="mt-6 space-y-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Place Senior Engineer at TechCorp</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">Submitted · Awaiting company approval</CardContent>
        </Card>
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Place Product Manager at FinCo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">In progress · Due Apr 15</CardContent>
        </Card>
      </div>
    </main>
  );
}
