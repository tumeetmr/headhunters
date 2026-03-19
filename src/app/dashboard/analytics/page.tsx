import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardAnalyticsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Analytics</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Profile views</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-black text-slate-950">2,431</CardContent>
        </Card>
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Proposal win rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-black text-slate-950">37%</CardContent>
        </Card>
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Avg response time</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-black text-slate-950">3.8h</CardContent>
        </Card>
      </div>
    </main>
  );
}
