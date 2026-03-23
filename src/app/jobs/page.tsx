"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Briefcase,
  Search,
  X,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { get } from "@/lib/api";
import { fetchMyProposals, submitProposal } from "@/lib/proposals-api";

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
  skills: Array<{ skill: { id: string; value?: string; name?: string } }>;
  status: string;
  feeType?: string;
}

function JobsPageContent() {
  const { data: session } = useSession();
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
  const [myProposalStatuses, setMyProposalStatuses] = useState<Record<string, string>>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposalPitch, setProposalPitch] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalMessage, setProposalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isRecruiter = session?.user?.role === "RECRUITER";

  useEffect(() => {
    let isMounted = true;

    async function loadMyProposals() {
      if (!isRecruiter) {
        setMyProposalStatuses({});
        return;
      }

      try {
        const proposals = await fetchMyProposals();
        if (!isMounted) return;

        const byJob = proposals.reduce<Record<string, string>>((acc, proposal) => {
          acc[proposal.jobOpeningId] = proposal.status;
          return acc;
        }, {});
        setMyProposalStatuses(byJob);
      } catch {
        if (!isMounted) return;
        setMyProposalStatuses({});
      }
    }

    void loadMyProposals();

    return () => {
      isMounted = false;
    };
  }, [isRecruiter]);

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
          ...job.skills.map((skillItem) => skillItem.skill.value || skillItem.skill.name || ""),
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

  async function handleSubmitProposal() {
    if (!selectedJob) {
      setProposalMessage({
        type: "error",
        text: "Select a job to submit a proposal.",
      });
      return;
    }

    const currentStatus = myProposalStatuses[selectedJob.id];
    if (currentStatus && currentStatus !== "WITHDRAWN") {
      setProposalMessage({
        type: "error",
        text: `You already submitted a proposal for this job (${currentStatus}).`,
      });
      return;
    }

    if (!proposalPitch.trim()) {
      setProposalMessage({ type: "error", text: "Pitch is required." });
      return;
    }

    const parsedDays = estimatedDays.trim() ? Number(estimatedDays) : undefined;
    if (parsedDays !== undefined && (!Number.isFinite(parsedDays) || parsedDays <= 0)) {
      setProposalMessage({
        type: "error",
        text: "Estimated days must be a valid positive number.",
      });
      return;
    }

    setIsSubmittingProposal(true);
    setProposalMessage(null);

    try {
      const created = await submitProposal({
        jobOpeningId: selectedJob.id,
        pitch: proposalPitch.trim(),
        estimatedDays: parsedDays,
      });

      setMyProposalStatuses((prev) => ({
        ...prev,
        [created.jobOpeningId]: created.status,
      }));

      setProposalMessage({
        type: "success",
        text: "Proposal submitted successfully.",
      });

      setTimeout(() => {
        setSelectedJob(null);
        setProposalPitch("");
        setEstimatedDays("");
        setProposalMessage(null);
      }, 900);
    } catch (submitError) {
      setProposalMessage({
        type: "error",
        text:
          submitError instanceof Error
            ? submitError.message
            : "Failed to submit proposal.",
      });
    } finally {
      setIsSubmittingProposal(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          className={`space-y-3 pb-6 lg:sticky lg:top-20 lg:z-40 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-0
            ${showFilters ? "block" : "hidden lg:block"}
          `}
        >

          {/* SEARCH BOX */}
          <div className="relative">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              placeholder="Search..."
            />
            <Search className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-slate-400" />
          </div>

          {/* CLEAR FILTERS */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <X className="size-3" />
              Clear
            </button>
          )}

          {/* QUICK FILTERS */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Quick
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
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">Level</h3>
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
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Category
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
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">Budget</h3>
            <div className="flex gap-1.5">
              <div className="flex min-w-fit items-center justify-center rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                {(salaryMin / 1000000).toFixed(1)}M
              </div>
              <div className="flex min-w-fit items-center justify-center rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                {(salaryMax / 1000000).toFixed(1)}M
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
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">Sort</h3>
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
            <div className="space-y-2">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                >
                  <CardContent className="p-3 sm:p-4">
                    {/* TOP ROW: TITLE & BADGES */}
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-bold text-slate-950 line-clamp-1">
                          {job.title}
                        </CardTitle>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">
                            {job.company.name}
                          </Badge>
                          <Badge className="text-xs bg-green-100 text-green-700">
                            {job.status}
                          </Badge>
                          {job.employmentType && (
                            <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                              {job.employmentType === "PART_TIME" ? "Part-time" : job.employmentType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* BUDGET - MOBILE: BELOW, DESKTOP: SIDE */}
                      {job.salaryMax && (
                        <div className="mt-1 rounded bg-slate-50 px-2 py-1 border border-slate-200 text-right sm:mt-0 sm:ml-2 sm:shrink-0">
                          <p className="text-xs font-semibold text-slate-600">
                            {new Intl.NumberFormat("en-US").format(job.salaryMin || 0)} – {new Intl.NumberFormat("en-US").format(job.salaryMax)} {job.salaryCurrency}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* LOCATION & SENIORITY */}
                    <div className="mb-2 flex flex-wrap gap-3 text-xs text-slate-600">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-slate-400" />
                          {job.location}
                        </span>
                      )}
                      {job.seniorityLevel && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3 text-slate-400" />
                          {job.seniorityLevel}
                        </span>
                      )}
                    </div>

                    {/* DESCRIPTION */}
                    <p className="mb-2 line-clamp-1 text-xs text-slate-700">
                      {job.description}
                    </p>

                    {/* SKILLS - ALL */}
                    {job.skills.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {job.skills.map((jobSkill, skillIndex) => (
                          <Badge
                            key={`${job.id}-${jobSkill.skill.id}-${skillIndex}`}
                            variant="outline"
                            className="text-xs border-slate-300 bg-slate-50 text-slate-700"
                          >
                            {jobSkill.skill.value || jobSkill.skill.name || "Skill"}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* ACTION BUTTON */}
                    {isRecruiter && (
                      <Button
                        disabled={Boolean(myProposalStatuses[job.id] && myProposalStatuses[job.id] !== "WITHDRAWN")}
                        onClick={() => {
                          setSelectedJob(job);
                          setProposalMessage(null);
                        }}
                        className="w-full h-8 text-xs bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 font-semibold transition-all duration-200"
                      >
                        {myProposalStatuses[job.id] && myProposalStatuses[job.id] !== "WITHDRAWN"
                          ? `✓ ${myProposalStatuses[job.id]}`
                          : "Submit Proposal"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    <Dialog
        open={Boolean(selectedJob)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedJob(null);
            setProposalPitch("");
            setEstimatedDays("");
            setProposalMessage(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Submit proposal for {selectedJob?.title || "job"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">Pitch</label>
              <textarea
                value={proposalPitch}
                onChange={(event) => setProposalPitch(event.target.value)}
                rows={5}
                placeholder="Explain why you are a strong fit for this role."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Estimated days to deliver shortlist
              </label>
              <Input
                type="number"
                min={1}
                value={estimatedDays}
                onChange={(event) => setEstimatedDays(event.target.value)}
                placeholder="e.g. 14"
              />
            </div>

            {proposalMessage && (
              <p
                className={`text-sm ${
                  proposalMessage.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {proposalMessage.text}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedJob(null)}
                disabled={isSubmittingProposal}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitProposal} disabled={isSubmittingProposal}>
                {isSubmittingProposal ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-8rem)] bg-slate-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          </div>
        </main>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
