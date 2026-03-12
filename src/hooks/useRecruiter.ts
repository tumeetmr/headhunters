"use client";

import { useEffect, useState, useCallback } from "react";
import { get } from "@/lib/api";

export interface RecruiterSkill {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterTag {
  id: string;
  recruiterProfileId: string;
  type: "EXPERTISE" | "INDUSTRY" | "LANGUAGE" | "CERTIFICATION";
  value: string;
  meta: unknown | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterLink {
  id: string;
  recruiterProfileId: string;
  type: "LINKEDIN" | "PHONE" | string;
  label: string;
  url: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterInsight {
  id: string;
  recruiterProfileId: string;
  title: string;
  description: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  status: string;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Recruiter {
  id: string;
  userId: string;
  slug: string;
  title: string;
  tagline: string | null;
  bio: string;
  photoUrl: string | null;
  heroImageUrl: string | null;
  yearsExperience: number | null;
  isLeadPartner: boolean;
  partnerBadge: string | null;
  publicEmail: string | null;
  publicPhone: string | null;
  location: string | null;
  timezone: string | null;
  rating: number;
  visibility: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  skills: RecruiterSkill[];
  tags: RecruiterTag[];
  links: RecruiterLink[];
  activeSearches: unknown[];
  insights: RecruiterInsight[];
}

interface UseRecruiterReturn {
  recruiters: Recruiter[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecruiter(): UseRecruiterReturn {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruiters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<Recruiter[]>("/recruiters", {
        params: { visibility: "PUBLISHED" },
      });
      setRecruiters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recruiters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  return { recruiters, loading, error, refetch: fetchRecruiters };
}

interface UseRecruiterBySlugReturn {
  recruiter: Recruiter | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecruiterBySlug(slug: string): UseRecruiterBySlugReturn {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruiter = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await get<Recruiter>(`/recruiters/slug/${slug}`);
      setRecruiter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recruiter");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRecruiter();
  }, [fetchRecruiter]);

  return { recruiter, loading, error, refetch: fetchRecruiter };
}
