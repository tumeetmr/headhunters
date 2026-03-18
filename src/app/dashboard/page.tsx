import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Tabs defaultValue="company">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Dashboard</h1>
            <p className="mt-2 text-slate-600">Role-based workspace for companies and recruiters.</p>
          </div>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="company" className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="font-semibold text-slate-900">Welcome back, Acme Corp.</p>
              <p className="text-sm text-slate-600">Monitor projects, proposals, contracts, and recruiting pipeline in one place.</p>
            </div>
            <Button>+ Post New Project</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Active Projects", "3 open · 1 in progress"],
              ["Proposals", "12 pending · 3 to review"],
              ["Contracts", "2 active · 1 completed"],
            ].map(([title, value]) => (
              <Card key={title} className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-700">{value}</CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Jane Cooper submitted a proposal on Senior Engineer · 2h ago</p>
              <p>Contract #4821 milestone approved · 1d ago</p>
              <p>New message from David M. · 2d ago</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Shortlisted Recruiters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              {["Jane", "David", "Sarah", "Mina", "Anu"].map((item) => (
                <Badge key={item} variant="secondary" className="bg-slate-100 text-slate-700">{item}</Badge>
              ))}
              <Button variant="ghost" asChild>
                <Link href="/dashboard/shortlist">View all</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiter" className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">Welcome back, Jane.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="success">Profile: Published</Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">★ 4.9</Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">Available</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Active proposals", "3"],
              ["Active contracts", "2"],
              ["This month earned", "MNT 1,250,000"],
              ["Total placements", "41"],
            ].map(([title, value]) => (
              <Card key={title} className="border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-sm">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-bold text-slate-950">{value}</CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Milestone Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Place Senior Engineer at TechCorp — SUBMITTED — awaiting approval</p>
              <p>Place Product Manager at FinCo — IN PROGRESS — due Apr 15</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
