"use client";

import Link from "next/link";
import { Suspense, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Star, X, Filter } from "lucide-react";
import { useRecruiter } from "@/hooks/useRecruiter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Image from "next/image";

function RecruitersPageContent() {
  const searchParams = useSearchParams();
  const { recruiters, loading, error } = useRecruiter();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
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
          recruiter.user?.name,
          recruiter.user?.username,
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
    <main className="min-h-[calc(100vh-8rem)] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* MOBILE FILTER TOGGLE */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Filter className="size-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {activeFilterCount > 0 && (
              <span className="ml-auto rounded-full bg-slate-900 text-white text-xs px-2 py-0.5">
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
            <Search className="absolute right-2.5 top-2.5 size-4 text-slate-400 pointer-events-none" />
          </div>

          {/* CLEAR FILTERS */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <X className="size-3" />
              Clear
            </button>
          )}

          {/* QUICK FILTERS */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Quick</h3>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleQuickFilter(filter)}
                  className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
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
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Level</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`px-3 py-1.5 rounded-md border text-xs transition-colors ${
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

          {/* INDUSTRY SECTION */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Industry</h3>
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => toggleIndustry(industry)}
                  className={`px-3 py-1.5 rounded-md border text-xs transition-colors ${
                    selectedIndustries.includes(industry)
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {/* RATING SECTION */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Rating</h3>
            <div className="flex gap-1.5">
              <div className="flex items-center justify-center rounded bg-slate-900 text-white px-2 py-1 text-xs font-semibold min-w-fit">
                {ratingMin.toFixed(1)}★
              </div>
              <div className="flex items-center justify-center rounded bg-slate-900 text-white px-2 py-1 text-xs font-semibold min-w-fit">
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
            <div className="flex justify-between text-xs text-slate-500">
              <span>0★</span>
              <span>5★</span>
            </div>
          </div>

          {/* SORT OPTIONS */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Sort</h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer">
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
                <span className="font-semibold text-slate-900">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-900">{recruiters.length}</span>
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="lg:hidden px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700"
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
            <Card className="border-slate-200 bg-white">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="text-slate-300 mb-4">
                  <Search className="size-12 mx-auto" />
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-2">No recruiters found</p>
                <p className="text-sm text-slate-600 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    onClick={clearAllFilters}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* RESULTS */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((recruiter) => {
                const skillTags = recruiter.tags
                  .filter((item) => item.skill.type === "SKILL" || item.skill.type === "EXPERTISE")
                  .slice(0, 3);

                return (
                  <Link key={recruiter.id} href={`/recruiters/${recruiter.slug}`} className="block">
                    <Card className="border-slate-200 bg-white hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
                      <CardContent className="p-0">
                      <div className="flex min-h-35">
                        {/* IMAGE */}
                        <div className="relative w-28 sm:w-36 shrink-0 bg-slate-200">
                          {recruiter.photoUrl ? (
                            <Image
                              src={recruiter.photoUrl}
                              alt={recruiter.slug}
                              fill
                              sizes="(max-width: 640px) 112px, 144px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-2">
                              <span className="text-slate-400 text-xs font-medium text-center">No photo</span>
                            </div>
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 min-w-0 p-4 sm:p-6">
                          <div className="flex items-start gap-2 flex-wrap">
                            <p className="text-base sm:text-lg font-bold text-slate-950">
                              {recruiter.user.name}
                            </p>
                            {recruiter.isLeadPartner && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs shrink-0">✓ Verified</Badge>
                            )}
                          </div>

                          {recruiter.title && (
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">{recruiter.title}</p>
                          )}

                          {recruiter.tagline && (
                            <p className="text-xs sm:text-sm text-slate-700 mt-2 line-clamp-2">{recruiter.tagline}</p>
                          )}

                          {/* STATS */}
                          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Star className="size-4 fill-amber-400 text-amber-400" />
                              {recruiter.rating > 0 ? recruiter.rating.toFixed(1) : "N/A"}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-600">{Math.max(1, recruiter.yearsExperience ?? 0)}+ yrs</span>
                          </div>

                          {/* SKILLS */}
                          {skillTags.length > 0 && (
                            <div className="mt-3 flex gap-1 flex-wrap">
                              {skillTags.map((tag, idx) => (
                                <Badge key={idx} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5">
                                  {tag.skill.value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </div>
    </main>
  );
}

export default function RecruitersPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-8rem)] bg-slate-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          </div>
        </main>
      }
    >
      <RecruitersPageContent />
    </Suspense>
  );
}
