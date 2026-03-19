"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VanishInput } from "@/components/ui/vanish-input";
import TalentSteps from "@/components/talent-steps";
import RecruiterList from "@/components/recruiter-list";
import InsightsSection from "@/components/insights-section";

export default function Home() {
  const router = useRouter();
  const [recruiterSearch, setRecruiterSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");

  const companySteps = [
    {
      title: "Create Account",
      time: "Sign up in seconds",
    },
    {
      title: "Post Your Role",
      time: "Describe the position you need fills",
    },
    {
      title: "Browse Recruiters",
      time: "Explore elite independent talent scouts",
    },
    {
      title: "Get Candidates",
      time: "Receive curated talent matches",
    },
  ];

  const recruiterSteps = [
    {
      title: "Create Profile",
      time: "Showcase your expertise & track record",
    },
    {
      title: "Apply to Roles",
      time: "Find companies that match your specialties",
    },
    {
      title: "Start Partnerships",
      time: "Connect directly with hiring teams",
    },
    {
      title: "Earn & Scale",
      time: "Get paid per successful placement",
    },
  ];

  return (
    <main>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative py-16 sm:py-20 lg:py-28 overflow-visible">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl -z-10"></div>

          <div className="gap-16 w-full">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <Badge className="mb-4 w-fit text-white border-0" style={{ background: "linear-gradient(90deg, #36CCC7 45.93%, #34E89E 72.8%)" }}>
                Headhunters
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-primary-text leading-tight mb-5">
                Where Exceptional Talent <br /> Meets Leading Companies
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
                Our headhunting service ensures you hire only the best saving time, cutting costs, and increasing productivity!
              </p>

              {/* Tabs and Search */}
              <Card className="border-slate-200 shadow-md max-w-xl" style={{ background: "linear-gradient(176.74deg, #1F2937 -13.59%, #637381 109.86%)" }}>
                <CardContent className="p-6">
                  <Tabs defaultValue="find" className="w-full">
                    <TabsList className="mb-6 bg-slate-100 border-slate-200">
                      <TabsTrigger value="find" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">Find Recruiter</TabsTrigger>
                      <TabsTrigger value="browse" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600">Browse Jobs</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="find" className="mt-0">
                        <VanishInput
                          placeholders={["Search by role, skills, or keywords"]}
                          onSubmit={() => {
                            if (recruiterSearch.trim()) {
                              router.push(`/recruiters?search=${encodeURIComponent(recruiterSearch)}`);
                            }
                          }}
                          onChange={(e) => setRecruiterSearch(e.target.value)}
                        />
                    </TabsContent>
                    <TabsContent value="browse" className="mt-0">
                        <VanishInput
                          placeholders={["Search by job title, company, or location"]}
                          onSubmit={() => {
                            if (jobSearch.trim()) {
                              router.push(`/jobs?search=${encodeURIComponent(jobSearch)}`);
                            }
                          }}
                          onChange={(e) => setJobSearch(e.target.value)}
                        />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">Featured recruiters</h2>
            <Button variant="ghost" asChild>
              <Link href="/recruiters">View all</Link>
            </Button>
          </div>
          <RecruiterList isLeadPartner={true} limit={5} columns="sm:grid-cols-2" />
        </section>

        <section className="py-16 sm:py-20">
          <Tabs defaultValue="companies">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">How it works</h2>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="companies">For Companies</TabsTrigger>
                <TabsTrigger value="recruiters">For Recruiters</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="companies" className="mt-12">
              <TalentSteps items={companySteps} activeIndex={0} />
            </TabsContent>

            <TabsContent value="recruiters" className="mt-12">
              <TalentSteps items={recruiterSteps} activeIndex={0} />
            </TabsContent>
          </Tabs>
        </section>

        <InsightsSection />

        <section className="py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">What companies say</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6">
                <p className="text-base leading-relaxed text-slate-700">
                  &quot;We hired a CFO in 3 weeks through Huntly. The recruiter already knew our industry cold.&quot;
                </p>
                <p className="mt-4 text-sm font-medium text-slate-500">Founder, Series B SaaS company</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-6">
                <p className="text-base leading-relaxed text-slate-700">
                  &quot;Finally a platform where my expertise is visible. I closed 4 contracts in my first month.&quot;
                </p>
                <p className="mt-4 text-sm font-medium text-slate-500">Independent recruiter, 9 years experience</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div
            className="rounded-3xl px-8 py-12 sm:px-12 sm:py-16"
            style={{
              background: "linear-gradient(176.74deg, #1F2937 -13.59%, #637381 109.86%)",
            }}
          >
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Ready to make your next hire?
            </h2>
            <p className="mt-4 text-lg text-slate-200">
              Access a marketplace of companies actively hiring top talent.
            </p>
            <Button size="lg" className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100" asChild>
              <Link href="/register">Join Us</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
