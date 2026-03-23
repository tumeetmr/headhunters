"use client";

import { recruitersApi } from "@/lib/api/modules/recruiters";
import { useApiOperation } from "@/hooks/api/useApiOperation";

export function useRecruitersApi() {
  const fetchRecruiters = useApiOperation(recruitersApi.fetchRecruiters);
  const fetchRecruiterBySlug = useApiOperation(recruitersApi.fetchRecruiterBySlug);

  return {
    fetchRecruiters,
    fetchRecruiterBySlug,
  };
}
