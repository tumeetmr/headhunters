import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardProfilePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Recruiter Profile</h1>
      <Card className="mt-6 border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Profile Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Badge variant="success">Published</Badge>
            <span>Visibility is set to public and discoverable.</span>
          </div>
          <p>Keep your expertise tags, active searches, and profile links updated for better conversion.</p>
        </CardContent>
      </Card>
    </main>
  );
}
