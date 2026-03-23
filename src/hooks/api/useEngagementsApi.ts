"use client";

import { engagementsApi } from "@/lib/api/modules/engagements";
import { useApiOperation } from "@/hooks/api/useApiOperation";

export function useEngagementsApi() {
  const fetchCompanyEngagements = useApiOperation(engagementsApi.fetchCompanyEngagements);
  const fetchRecruiterEngagements = useApiOperation(engagementsApi.fetchRecruiterEngagements);
  const fetchEngagementById = useApiOperation(engagementsApi.fetchEngagementById);
  const updateEngagement = useApiOperation(engagementsApi.updateEngagement);

  return {
    fetchCompanyEngagements,
    fetchRecruiterEngagements,
    fetchEngagementById,
    updateEngagement,
  };
}
