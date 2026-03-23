"use client";

import { useEffect, useState, useCallback } from "react";
import { recruitersApi, type Recruiter } from "@/lib/api/modules/recruiters";

export type { Recruiter };

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
      const data = await recruitersApi.fetchRecruiters();
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
      const data = await recruitersApi.fetchRecruiterBySlug(slug);
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
