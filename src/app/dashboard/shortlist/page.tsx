import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardShortlistPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Shortlisted Recruiters</h1>
        <Button asChild>
          <Link href="/recruiters">Find more recruiters</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Jane Cooper", "David M.", "Sarah K.", "Mina T.", "Anu B."]?.map((name) => (
          <Card key={name} className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">Top rated · Fast response · Domain specialist</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
