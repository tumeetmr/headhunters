import { engagementsApi } from "@/lib/api/modules/engagements";

export * from "@/lib/api/modules/engagements";

export const fetchCompanyEngagements = engagementsApi.fetchCompanyEngagements;
export const fetchRecruiterEngagements = engagementsApi.fetchRecruiterEngagements;
export const fetchEngagementById = engagementsApi.fetchEngagementById;
export const updateEngagement = engagementsApi.updateEngagement;
