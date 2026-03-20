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
  recruiterId: string;
  companyId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  answers: Array<{
    id: string;
    formFieldId: string;
    value: string;
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
