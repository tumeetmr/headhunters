"use client";

import Link from "next/link";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, Star, ChevronRight, X } from "lucide-react";
import { useRecruiter } from "@/hooks/useRecruiter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

export default function RecruitersPage() {
  const searchParams = useSearchParams();
  const { recruiters, loading, error } = useRecruiter();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [ratingMin, setRatingMin] = useState(0);
  const [ratingMax, setRatingMax] = useState(5);
  const [sortOption, setSortOption] = useState<string>("recommended");

  const quickFilters = ["Available", "New", "Top Rated", "Verified"];
  const levels = ["Executive/Leadership", "Senior", "Mid-level", "Junior", "Entry-level"];
  const industries = ["Tech", "Finance", "Healthcare", "Legal", "Consumer", "Real Estate", "E-commerce"];
  const sortOptions = [
    { id: "recommended", label: "Recommended for You" },
    { id: "top-rated", label: "Top Rated" },
    { id: "most-placements", label: "Most Placements" },
    { id: "newest", label: "Newest" },
    { id: "available", label: "Available First" },
  ];

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

  const toggleIndustry = useCallback((industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setQuery("");
    setSelectedQuickFilters([]);
    setSelectedLevel([]);
    setSelectedIndustries([]);
    setRatingMin(0);
    setRatingMax(5);
    setSortOption("recommended");
  }, []);

  const filtered = useMemo(() => {
    let results = recruiters;

    // Search filter
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      results = results.filter((recruiter) => {
        const searchText = [
          recruiter.slug,
          recruiter.title,
          recruiter.tagline,
          recruiter.location,
          ...recruiter.tags.map((t) => t.skill.value),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchText.includes(searchLower);
      });
    }

    // Quick filters
    if (selectedQuickFilters.length > 0) {
      results = results.filter((recruiter) => {
        if (selectedQuickFilters.includes("Available") && !recruiter.visibility) return false;
        if (selectedQuickFilters.includes("Top Rated") && recruiter.rating < 4.5) return false;
        if (selectedQuickFilters.includes("Verified") && !recruiter.isLeadPartner) return false;
        return true;
      });
    }

    // Level filter (based on experience)
    if (selectedLevel.length > 0) {
      results = results.filter((recruiter) => {
        const yearsExp = recruiter.yearsExperience || 0;
        return selectedLevel.some((level) => {
          if (level === "Executive/Leadership") return yearsExp >= 15;
          if (level === "Senior") return yearsExp >= 10 && yearsExp < 15;
          if (level === "Mid-level") return yearsExp >= 5 && yearsExp < 10;
          if (level === "Junior") return yearsExp >= 2 && yearsExp < 5;
          if (level === "Entry-level") return yearsExp < 2;
          return false;
        });
      });
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      results = results.filter((recruiter) =>
        recruiter.tags.some((tag) =>
          selectedIndustries.some((ind) =>
            tag.skill.value.toLowerCase().includes(ind.toLowerCase())
          )
        )
      );
    }

    // Rating filter
    results = results.filter(
      (recruiter) => recruiter.rating >= ratingMin && recruiter.rating <= ratingMax
    );

    // Sorting
    const sorted = [...results];
    switch (sortOption) {
      case "top-rated":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "most-placements":
        sorted.sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "available":
        sorted.sort((a, b) => {
          if (a.visibility === b.visibility) return 0;
          return a.visibility === "PUBLISHED" ? -1 : 1;
        });
        break;
      case "recommended":
      default:
        sorted.sort((a, b) => b.rating - a.rating);
        break;
    }

    return sorted;
  }, [query, selectedQuickFilters, selectedLevel, selectedIndustries, ratingMin, ratingMax, sortOption, recruiters]);

  const activeFilterCount = 
    (query ? 1 : 0) +
    selectedQuickFilters.length +
    selectedLevel.length +
    selectedIndustries.length +
    (ratingMin > 0 || ratingMax < 5 ? 1 : 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Browse Recruiters</h1>
          <p className="mt-2 text-slate-600">Search-first discovery with trust signals, ratings, and proven placement history.</p>
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
              placeholder="Search by name or specialty"
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

          {/* CLEAR FILTERS */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <X className="size-4" />
              Clear Filters ({activeFilterCount})
            </button>
          )}

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

          {/* INDUSTRY SECTION */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-950">Industry</h3>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => toggleIndustry(industry)}
                  className={`px-2 py-0.5 rounded-sm border text-sm transition-colors ${
                    selectedIndustries.includes(industry)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {industry}
                </button>
              ))}
              <button className="px-2 py-0.5 rounded-sm border text-sm font-medium transition-colors border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                More
              </button>
            </div>
          </div>

          {/* RATING SECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Rating Range</h3>
            <div className="flex gap-3">
              <div className="flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold min-w-fit">
                {ratingMin.toFixed(1)}★
              </div>
              <div className="flex items-center justify-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold min-w-fit">
                {ratingMax.toFixed(1)}★
              </div>
            </div>
            <Slider
              value={[ratingMin, ratingMax]}
              onValueChange={(values) => {
                setRatingMin(values[0]);
                setRatingMax(values[1]);
              }}
              max={5}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600">
              <span>0★</span>
              <span>5★</span>
            </div>
          </div>

          {/* SORT OPTIONS */}
          <div className="space-y-3 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-950">Sort By</h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value={option.id}
                    checked={sortOption === option.id}
                    onChange={() => setSortOption(option.id)}
                    className="size-4"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - RESULTS */}
        <div className="space-y-4">
          {/* RESULT COUNT */}
          {!loading && !error && (
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{recruiters.length}</span> recruiters
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-slate-200 bg-white animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm text-red-600 font-medium">Error loading recruiters</p>
                <p className="text-sm text-red-500 mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && filtered.length === 0 && (
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="pt-12 text-center pb-12">
                <div className="text-slate-400 mb-3">
                  <Search className="size-12 mx-auto" />
                </div>
                <p className="text-base font-semibold text-slate-900 mb-1">No recruiters found</p>
                <p className="text-sm text-slate-600">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* RESULTS */}
          {!loading && !error && filtered.length > 0 && (
            filtered.map((recruiter) => {
              const skillTags = recruiter.tags
                .filter((item) => item.skill.type === "SKILL" || item.skill.type === "EXPERTISE")
                .slice(0, 4);

              return (
                <Card key={recruiter.id} className="border-slate-200 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">{recruiter.slug.replaceAll("-", " ")}</p>
                        <p className="text-sm text-slate-600">{recruiter.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="size-4" />
                          {recruiter.location || "Remote"} · {recruiter.timezone || "GMT+8"}
                        </p>
                      </div>
                      <Button asChild>
                        <Link href={`/recruiters/${recruiter.slug}`}>View Profile</Link>
                      </Button>
                    </div>

                    {recruiter.tagline && <p className="mt-3 text-sm text-slate-700">&quot;{recruiter.tagline}&quot;</p>}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {skillTags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="border-slate-200 bg-white text-slate-700">
                          {tag.skill.value}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {recruiter.rating > 0 ? recruiter.rating.toFixed(1) : "N/A"} ({Math.max(5, skillTags.length * 2)} reviews)
                      </span>
                      <span>·</span>
                      <span>{Math.max(1, recruiter.yearsExperience ?? 0)}+ years</span>
                      {recruiter.isLeadPartner && (
                        <>
                          <span>·</span>
                          <Badge variant="success" className="bg-blue-100 text-blue-700">Verified</Badge>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
