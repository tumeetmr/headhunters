import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardInvoicesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Invoices</h1>
      <div className="mt-6 space-y-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Invoice #019</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-slate-700">
            <p>MNT 550,000 · Sent · Due Apr 10</p>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Invoice #018</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-slate-700">
            <p>MNT 320,000 · Paid</p>
            <Badge variant="success">Paid</Badge>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
