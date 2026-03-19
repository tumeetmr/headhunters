"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Briefcase,
  ChevronRight,
  Search,
  X,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(50000000);
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

  // Fetch jobs with filters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();

        if (query) params.append("search", query);
        if (selectedLevel.length > 0) {
          params.append("seniorityLevel", selectedLevel[0]); // API expects single value
        }
        if (salaryMin > 0) params.append("salaryMin", String(salaryMin));
        if (salaryMax < 50000000) params.append("salaryMax", String(salaryMax));
        if (selectedQuickFilters.includes("Remote work")) {
          params.append("location", "Remote");
        }
        if (selectedQuickFilters.includes("Part-time")) {
          params.append("employmentType", "PART_TIME");
        }

        const response = await get(`/job-openings?${params.toString()}`);
        setJobs(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setError(error instanceof Error ? error.message : "Failed to load jobs");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedLevel, salaryMin, salaryMax, selectedQuickFilters]);

  const toggleQuickFilter = useCallback((filter: string) => {
    setSelectedQuickFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  }, []);

  const toggleLevel = useCallback((level: string) => {
    setSelectedLevel((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setQuery("");
    setSelectedQuickFilters([]);
    setSelectedLevel([]);
    setSelectedCategories([]);
    setSalaryMin(0);
    setSalaryMax(50000000);
    setSortOption("recommended");
  }, []);

  const filteredJobs = useMemo(() => {
    let results = [...jobs];

    if (selectedQuickFilters.includes("High salary")) {
      results = results.filter((job) => (job.salaryMax || 0) >= 10000000);
    }

    if (selectedQuickFilters.includes("New")) {
      // Fallback heuristic while created date is not available in job type.
      results = results.slice(0, 20);
    }

    if (selectedCategories.length > 0) {
      results = results.filter((job) => {
        const searchText = [
          job.title,
          job.description,
          ...job.skills.map((skillItem) => skillItem.skill.name),
        ]
          .join(" ")
          .toLowerCase();

        return selectedCategories.some((category) =>
          searchText.includes(category.toLowerCase())
        );
      });
    }

    const sorted = [...results];
    switch (sortOption) {
      case "newest":
        sorted.reverse();
        break;
      case "salaryHigh":
        sorted.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
      case "salaryLow":
        sorted.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
        break;
      case "recommended":
      default:
        sorted.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
    }

    return sorted;
  }, [jobs, selectedCategories, selectedQuickFilters, sortOption]);

  const activeFilterCount =
    (query ? 1 : 0) +
    selectedQuickFilters.length +
    selectedLevel.length +
    selectedCategories.length +
    (salaryMin > 0 || salaryMax < 50000000 ? 1 : 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Job Openings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Real hiring mandates. Clear budgets. Find perfect matches and submit proposals.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* MOBILE FILTER TOGGLE */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Filter className="size-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {activeFilterCount > 0 && (
              <span className="ml-auto rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* LEFT SIDEBAR - FILTERS */}
        <div
          className={`space-y-6 pb-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pb-0
            ${showFilters ? "block" : "hidden lg:block"}
          `}
        >
          {/* SEARCH HEADING */}
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Search</h2>
          </div>

          {/* SEARCH BOX */}
          <div className="relative">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-lg border-2 border-slate-200 bg-white px-4 text-base placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              placeholder="Search by job title or skill"
            />
            <Search className="pointer-events-none absolute right-3 top-3 size-5 text-slate-400" />
          </div>

          {/* RECOMMENDED FOR YOU */}
          <button className="flex w-full items-center gap-3 rounded-lg border border-slate-300 bg-linear-to-r from-slate-50 to-slate-100 px-3 py-3 text-left transition-colors hover:bg-slate-100">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-900">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">AI Recommendations</p>
              <p className="text-xs text-slate-500">Personalized matches</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-slate-400" />
          </button>

          {/* CLEAR FILTERS */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <X className="size-4" />
              Clear All
            </button>
          )}

          {/* DIVIDER */}
          <div className="border-t border-slate-200"></div>

          {/* QUICK FILTERS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleQuickFilter(filter)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedQuickFilters.includes(filter)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* LEVEL SECTION */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Level</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    selectedLevel.includes(level)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* JOB CATEGORY SECTION */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
              Job Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    selectedCategories.includes(category)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* SALARY SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Budget</h3>
            <div className="flex gap-2">
              <div className="flex min-w-fit items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                {(salaryMin / 1000000).toFixed(1)}M MNT
              </div>
              <div className="flex min-w-fit items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                {(salaryMax / 1000000).toFixed(1)}M MNT
              </div>
            </div>
            <Slider
              value={[salaryMin, salaryMax]}
              onValueChange={(values) => {
                setSalaryMin(values[0]);
                setSalaryMax(values[1]);
              }}
              min={0}
              max={50000000}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>50M MNT</span>
            </div>
          </div>

          {/* SORT SECTION */}
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Sort</h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="sort"
                    value={option.id}
                    checked={sortOption === option.id}
                    onChange={() => setSortOption(option.id)}
                    className="size-4 accent-slate-900"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - RESULTS */}
        <div className="space-y-8">
          {/* RESULT COUNT & SORT ON MOBILE */}
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filteredJobs.length}</span> of{" "}
                <span className="font-semibold text-slate-900">{jobs.length}</span>
              </div>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 lg:hidden"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((idx) => (
                <Card key={idx} className="animate-pulse border-slate-200 bg-white">
                  <CardContent className="pt-6">
                    <div className="mb-4 h-6 w-1/3 rounded bg-slate-200"></div>
                    <div className="mb-3 h-4 w-1/4 rounded bg-slate-200"></div>
                    <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-red-600">Error loading jobs</p>
                <p className="mt-1 text-sm text-red-500">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && filteredJobs.length === 0 && (
            <Card className="border-slate-200 bg-white">
              <CardContent className="pb-16 pt-16 text-center">
                <div className="mb-4 text-slate-300">
                  <Search className="mx-auto size-12" />
                </div>
                <p className="mb-2 text-lg font-semibold text-slate-900">No jobs found</p>
                <p className="mb-6 text-sm text-slate-600">Try adjusting your filters or search terms.</p>
                {activeFilterCount > 0 && (
                  <Button onClick={clearAllFilters} className="bg-slate-900 text-white hover:bg-slate-800">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* RESULTS */}
          {!loading && !error && filteredJobs.length > 0 && (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer border-slate-200 bg-white transition-all duration-200 hover:shadow-lg"
                >
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
                        {job.skills.map((jobSkill) => (
                          <Badge
                            key={jobSkill.skill.name}
                            variant="outline"
                            className="border-slate-200 bg-white text-slate-700"
                          >
                            {jobSkill.skill.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      {job.salaryMax && (
                        <p className="text-sm font-semibold text-slate-900">
                          Budget: {new Intl.NumberFormat("en-US").format(job.salaryMin || 0)} -{" "}
                          {new Intl.NumberFormat("en-US").format(job.salaryMax)} {job.salaryCurrency}
                        </p>
                      )}
                      <Button>Submit Proposal</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <Card key={idx} className="animate-pulse border-slate-200 bg-white">
                <CardContent className="pt-6">
                  <div className="mb-4 h-6 w-1/3 rounded bg-slate-200"></div>
                  <div className="mb-3 h-4 w-1/4 rounded bg-slate-200"></div>
                  <div className="h-4 w-1/2 rounded bg-slate-200"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
