import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardMessagesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Messages</h1>
      <div className="mt-6 space-y-4">
        {[
          ["David M.", "I can start sourcing candidates this week."],
          ["Jane Cooper", "Shared a shortlist for your backend role."],
          ["FinTechOS", "Milestone approved. Invoice will be processed."],
        ].map(([name, preview]) => (
          <Card key={name} className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base">{name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">{preview}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
