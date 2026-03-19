import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardProposalsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Proposals</h1>
      <div className="mt-6 space-y-4">
        {["Jane Cooper", "David M.", "Sarah K."].map((name) => (
          <Card key={name} className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-slate-700">
              <p>Submitted proposal for Senior Engineer project.</p>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">To review</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
