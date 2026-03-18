import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardContractsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Contracts</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {["Contract #4821", "Contract #4924"].map((contract) => (
          <Card key={contract} className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{contract}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-slate-700">
              <p>Milestone-based contract with defined payout gates.</p>
              <Badge variant="success">Active</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
