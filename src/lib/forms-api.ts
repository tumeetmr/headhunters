import { post, get, put } from "@/lib/api";

export interface FormField {
  id: string;
  key: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  isActive?: boolean;
  fields?: FormField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormAnswer {
  formFieldId: string;
  value: string;
}

export interface CreateRequestPayload {
  formTemplateId: string;
  recruiterId?: string;
  companyId?: string;
  answers: FormAnswer[];
}

export interface RecruitRequest {
  id: string;
  formTemplateId: string;
  recruiterId: string | null;
  companyId: string | null;
  status: string;
  respondedAt?: string | null;
  counterProposal?: Record<string, unknown> | null;
  counterProposalMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    description?: string | null;
    industry?: string | null;
    location?: string | null;
    logoUrl?: string | null;
    user?: { id: string; name?: string | null; email?: string | null };
    _count?: {
      engagements: number;
      jobOpenings: number;
      requests: number;
    };
  };
  recruiter?: {
    id: string;
    slug?: string | null;
    title?: string | null;
    photoUrl?: string | null;
    tagline?: string | null;
    yearsExperience?: number | null;
    location?: string | null;
    rating?: number;
    isVerified?: boolean;
    publicEmail?: string | null;
    user?: { id: string; name?: string | null; email?: string | null };
    _count?: {
      engagements: number;
      activeSearches: number;
      tags: number;
    };
  };
  formTemplate?: {
    id: string;
    name: string;
    fields?: FormField[];
  };
  answers: Array<{
    id: string;
    formFieldId: string;
    value: string;
    formField?: FormField;
  }>;
}

/**
 * Fetch all active form templates
 */
export async function fetchFormTemplates(): Promise<FormTemplate[]> {
  return get<FormTemplate[]>("/form-templates");
}

/**
 * Fetch a specific form template by ID
 */
export async function fetchFormTemplate(
  templateId: string
): Promise<FormTemplate> {
  return get<FormTemplate>(`/form-templates/${templateId}`);
}

/**
 * Submit a recruiter request with form answers
 */
export async function submitRecruiterRequest(
  payload: CreateRequestPayload
): Promise<RecruitRequest> {
  return post<RecruitRequest>("/requests", payload);
}

/**
 * Fetch all requests for the current user
 */
export async function fetchRequests(status?: string): Promise<RecruitRequest[]> {
  const params = status ? `?status=${status}` : "";
  return get<RecruitRequest[]>(`/requests${params}`);
}

/**
 * Fetch a specific request by ID
 */
export async function fetchRequest(requestId: string): Promise<RecruitRequest> {
  return get<RecruitRequest>(`/requests/${requestId}`);
}

/**
 * Update request status
 */
export async function updateRequestStatus(
  requestId: string,
  status: string
): Promise<RecruitRequest> {
  return put<RecruitRequest>(`/requests/${requestId}/status`, { status });
}

export async function submitCounterProposal(
  requestId: string,
  payload: {
    proposal?: Record<string, unknown>;
    message?: string;
  }
): Promise<RecruitRequest> {
  return put<RecruitRequest>(`/requests/${requestId}/counter`, payload);
}

export async function resolveCounterProposal(
  requestId: string,
  status: "ACCEPTED" | "DECLINED"
): Promise<RecruitRequest> {
  return put<RecruitRequest>(`/requests/${requestId}/counter/resolve`, { status });
}
