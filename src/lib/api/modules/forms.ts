import { get, post, put } from "@/lib/api";

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

export const formsApi = {
  fetchFormTemplates() {
    return get<FormTemplate[]>("/form-templates");
  },

  fetchFormTemplate(templateId: string) {
    return get<FormTemplate>(`/form-templates/${templateId}`);
  },

  submitRecruiterRequest(payload: CreateRequestPayload) {
    return post<RecruitRequest>("/requests", payload);
  },

  fetchRequests(status?: string) {
    const params = status ? `?status=${status}` : "";
    return get<RecruitRequest[]>(`/requests${params}`);
  },

  fetchRequest(requestId: string) {
    return get<RecruitRequest>(`/requests/${requestId}`);
  },

  updateRequestStatus(requestId: string, status: string) {
    return put<RecruitRequest>(`/requests/${requestId}/status`, { status });
  },

  submitCounterProposal(
    requestId: string,
    payload: {
      proposal?: Record<string, unknown>;
      message?: string;
    },
  ) {
    return put<RecruitRequest>(`/requests/${requestId}/counter`, payload);
  },

  resolveCounterProposal(requestId: string, status: "ACCEPTED" | "DECLINED") {
    return put<RecruitRequest>(`/requests/${requestId}/counter/resolve`, { status });
  },
};
