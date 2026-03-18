"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {  MapPin, Briefcase, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { get } from "@/lib/api";

interface Job {
  id: string;
  title: string;
  company: { name: string };
  location?: string;
  seniorityLevel?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  description: string;
  skills: Array<{ skill: { name: string } }>;
  status: string;
  feeType?: string;
}

export default function JobsPage() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(5000);
  const [sortOption, setSortOption] = useState<string>("recommended");

  const quickFilters = ["New", "Remote work", "Saved", "Part-time", "High salary"];
  const levels = ["EXECUTIVE", "SENIOR", "MID", "JUNIOR"];
  const categories = ["Management and Operations", "Accounting, Finance, Consulting", "Education & Pedagogy"];
  const sortOptions = [
    { id: "recommended", label: "Recommended for You" },
    { id: "newest", label: "Newest" },
    { id: "salaryHigh", label: "Highest Budget" },
    { id: "salaryLow", label: "Lowest Budget" },
  ];

  const levelMap: any = {
    "Executive/Leadership": "EXECUTIVE",
    Senior: "SENIOR",
    "Mid-level": "MID",
    Junior: "JUNIOR",
    "Entry-level": "ENTRY",
  };

  const employmentTypeMap: any = {
    "Part-time": "PART_TIME",
  };

  // Fetch jobs with filters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (query) params.append("search", query);
        if (selectedLevel.length > 0) {
          params.append("seniorityLevel", selectedLevel[0]); // API expects single value
        }
        if (salaryMin > 0) params.append("salaryMin", String(salaryMin * 1000));
        if (salaryMax < 5000) params.append("salaryMax", String(salaryMax * 1000));
        if (selectedQuickFilters.includes("Remote work")) {
          params.append("location", "Remote");
        }
        if (selectedQuickFilters.includes("Part-time")) {
          params.append("employmentType", "PART_TIME");
        }
        if (sortOption !== "recommended") {
          params.append("sortBy", sortOption);
        }

        const response = await get(`/job-openings?${params.toString()}`);
        setJobs(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedLevel, salaryMin, salaryMax, selectedQuickFilters, sortOption]);

  const toggleQuickFilter = (filter: string) => {
    setSelectedQuickFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevel((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Job Openings</h1>
            <p className="mt-2 text-slate-600">Real hiring mandates. Clear budgets. Find perfect matches and submit proposals.</p>
          </div>
          <Button>Post New Job</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* LEFT SIDEBAR - FILTERS */}
        <div className="space-y-6 sticky top-0 max-h-screen overflow-y-auto">
          {/* SEARCH HEADING */}
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Search</h2>
          </div>

          {/* SEARCH BOX */}
          <div className="relative">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 border-2 border-slate-300 bg-white px-4 rounded-lg text-base placeholder:text-slate-400"
              placeholder="Search by job title or skill"
            />
          </div>

          {/* RECOMMENDED FOR YOU */}
          <button className="w-full flex items-center gap-4 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left hover:bg-slate-50 transition-colors">
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 shrink-0">
              <span className="text-white font-semibold text-sm">AI</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">Recommended for me</p>
              <p className="text-xs text-slate-600">Get personalized recommendations</p>
            </div>
            <ChevronRight className="size-5 text-slate-400 shrink-0" />
          </button>

          {/* QUICK FILTERS */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleQuickFilter(filter)}
                className={`px-2 py-0.5 rounded-sm border text-sm font-medium transition-colors ${
                  selectedQuickFilters.includes(filter)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* LEVEL SECTION */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-950">Level</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`px-2 py-0.5 rounded-sm border text-sm transition-colors ${
                    selectedLevel.includes(level)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* JOB CATEGORY SECTION */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-950">Job category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-2 py-0.5 rounded-sm border text-sm transition-colors ${
                    selectedCategories.includes(category)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {category}
                </button>
              ))}
              <button className="px-2 py-0.5 rounded-sm border text-sm font-medium transition-colors border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                More
              </button>
            </div>
          </div>

          {/* SALARY SECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Budget</h3>
            <div className="flex gap-3">
              <div className="flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold min-w-fit">
                ${salaryMin}k
              </div>
              <div className="flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold min-w-fit">
                ${salaryMax}k
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="5000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Math.min(Number(e.target.value), salaryMax))}
                className="w-full accent-slate-900"
              />
              <input
                type="range"
                min="0"
                max="5000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Math.max(Number(e.target.value), salaryMin))}
                className="w-full accent-slate-900"
              />
              <div className="flex justify-between text-xs text-slate-600 pt-2">
                <span>min</span>
                <span>max</span>
              </div>
            </div>
          </div>

          {/* COMPANIES SECTION */}
          <button className="w-full flex items-center justify-between rounded-full border-2 border-slate-300 bg-white px-5 py-4 text-left hover:bg-slate-50 transition-colors">
            <p className="text-base font-semibold text-slate-900">Companies</p>
            <ChevronRight className="size-5 text-slate-400" />
          </button>

          {/* SORT SECTION */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-950">Sort By</h3>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT SIDE - RESULTS */}
        <div className="space-y-4">
          {loading && (
            <Card className="border-slate-200 bg-white">
              <CardContent className="pt-6 text-sm text-slate-600">
                Loading jobs...
              </CardContent>
            </Card>
          )}
          {!loading && jobs.length === 0 && (
            <Card className="border-slate-200 bg-white">
              <CardContent className="pt-6 text-sm text-slate-600">
                No jobs matched your filters. Try a broader keyword.
              </CardContent>
            </Card>
          )}
          {jobs.map((job) => (
            <Card key={job.id} className="border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-slate-200 text-slate-600">
                    {job.company.name}
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {job.status}
                  </Badge>
                  {job.employmentType && (
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {job.employmentType}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription className="flex flex-wrap gap-3 text-sm">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {job.location}
                    </span>
                  )}
                  {job.location && job.seniorityLevel && <span>·</span>}
                  {job.seniorityLevel && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-4" />
                      {job.seniorityLevel}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">{job.description}</p>

                {job.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((js) => (
                      <Badge key={js.skill.name} variant="outline" className="border-slate-200 bg-white text-slate-700">
                        {js.skill.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  {job.salaryMax && (
                    <p className="text-sm font-semibold text-slate-900">
                      Budget: ${job.salaryMin || 0}
                      {job.salaryMax ? `k - $${job.salaryMax}k` : ""}
                    </p>
                  )}
                  <Button>Submit Proposal</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
