import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardInsightsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Insights</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>How we filled a VP Engineering role in 18 days</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">Case study draft · Ready to publish</CardContent>
        </Card>
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>SEA hiring benchmark for backend engineers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">Blog post · In review</CardContent>
        </Card>
      </div>
    </main>
  );
}
