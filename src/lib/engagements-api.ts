import { get, put } from "@/lib/api";

export type EngagementStatus = "ACTIVE" | "FILLED" | "CLOSED" | "CANCELLED";

export interface Engagement {
  id: string;
  jobOpeningId: string;
  recruiterProfileId: string;
  companyId: string;
  applicationId?: string | null;
  status: EngagementStatus;
  agreedFeeType?: string | null;
  agreedFeePercentage?: number | string | null;
  agreedFeeFixed?: number | string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  recruiterProfile?: {
    id: string;
    slug?: string | null;
    title?: string | null;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  };
  company?: {
    id: string;
    name?: string | null;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  };
  jobOpening?: {
    id: string;
    title?: string | null;
    status?: string | null;
  };
  placements?: Array<{
    id: string;
    status: string;
    candidateName?: string | null;
    createdAt: string;
  }>;
}

export async function fetchCompanyEngagements(companyId: string): Promise<Engagement[]> {
  return get<Engagement[]>(`/engagements/company/${companyId}`);
}

export async function fetchRecruiterEngagements(recruiterId: string): Promise<Engagement[]> {
  return get<Engagement[]>(`/engagements/recruiter/${recruiterId}`);
}

export async function fetchEngagementById(engagementId: string): Promise<Engagement> {
  return get<Engagement>(`/engagements/${engagementId}`);
}

export async function updateEngagement(
  engagementId: string,
  payload: Partial<Pick<Engagement, "status" | "startDate" | "endDate">> & Record<string, unknown>
): Promise<Engagement> {
  return put<Engagement>(`/engagements/${engagementId}`, payload);
}
