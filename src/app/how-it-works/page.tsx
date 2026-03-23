import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";

const companySteps = [
  ["Step 1 - Post a Project", "Tell us about the role, budget, and what success looks like. It is free to post."],
  ["Step 2 - Receive Proposals", "Within 48 hours, matched recruiters submit proposals you can compare side by side."],
  ["Step 3 - Start a Contract", "Accept your preferred proposal and define milestones together before execution."],
  ["Step 4 - Approve and Pay", "Approve milestone completion, then release payment with full fee transparency."],
];

const recruiterSteps = [
  ["Step 1 - Build Your Profile", "Add your specialisation, track record, skills, and links so companies can discover you."],
  ["Step 2 - Browse Open Projects", "Filter mandates by industry, location, and type, then submit focused proposals."],
  ["Step 3 - Deliver and Submit", "Track contract milestones and submit progress updates directly in-platform."],
  ["Step 4 - Get Paid", "Invoices are auto-generated with transparent platform fees before you commit."],
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Tabs defaultValue="company" className="mt-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="company">For Companies</TabsTrigger>
          <TabsTrigger value="recruiter">For Recruiters</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <div className="mt-12 space-y-12">
            {companySteps.map(([title, desc], index) => (
              <div
                key={title}
                className="flex justify-between items-center"
              >
                {/* Text Content */}
                <div className={`flex-1 ${index % 2 === 1 ? "text-right" : "text-left"}`}>
                  <div className="text-sm font-bold text-emerald-600">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-3 text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Banner Section */}
          <div
            className="mt-12 rounded-3xl px-8 py-12 sm:px-12 sm:py-16"
            style={{
              background: "linear-gradient(176.74deg, #1F2937 -13.59%, #637381 109.86%)",
            }}
          >
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              If you wanna hire exceptional talents
            </h2>
            <p className="mt-4 text-lg text-slate-200">
              Access a curated network of top recruiters ready to deliver results.
            </p>
            <Button size="lg" className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100" asChild>
              <Link href="/register">Join Us</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="recruiter" className="mt-4">
          <div className="mt-12 space-y-12">
            {recruiterSteps.map(([title, desc], index) => (
              <div
                key={title}
                className="flex justify-between items-center"
              >
                {/* Text Content */}
                <div className={`flex-1 ${index % 2 === 1 ? "text-right" : "text-left"}`}>
                  <div className="text-sm font-bold text-emerald-600">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-3 text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Banner Section */}
          <div
            className="mt-12 rounded-3xl px-8 py-12 sm:px-12 sm:py-16"
            style={{
              background: "linear-gradient(176.74deg, #1F2937 -13.59%, #637381 109.86%)",
            }}
          >
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              If you wanna grow your recruiting business
            </h2>
            <p className="mt-4 text-lg text-slate-200">
              Access a marketplace of companies actively hiring top talent.
            </p>
            <Button size="lg" className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100" asChild>
              <Link href="/register">Join Us</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
