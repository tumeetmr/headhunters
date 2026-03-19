import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Dashboard Projects</h1>
        <Button>+ Create Project</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["Senior Engineer", "Finance Director", "Regional Sales Lead"].map((project) => (
          <Card key={project} className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{project}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">Open · 4 proposals · Updated 3h ago</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
