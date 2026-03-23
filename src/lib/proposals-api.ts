import { get, post } from "@/lib/api";

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface Proposal {
  id: string;
  jobOpeningId: string;
  recruiterProfileId: string;
  pitch?: string | null;
  estimatedDays?: number | null;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  recruiterProfile?: {
    id: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
    slug?: string | null;
    rating?: number | null;
    title?: string | null;
    yearsExperience?: number | null;
  };
  jobOpening?: {
    id: string;
    title: string;
    location?: string | null;
    seniorityLevel?: string | null;
    company?: {
      id: string;
      name: string;
    };
  };
}

export interface SubmitProposalPayload {
  jobOpeningId: string;
  pitch?: string;
  estimatedDays?: number;
}

export async function submitProposal(payload: SubmitProposalPayload): Promise<Proposal> {
  return post<Proposal>("/applications", payload);
}

export async function fetchMyProposals(): Promise<Proposal[]> {
  return get<Proposal[]>("/applications/my");
}

export async function fetchJobProposals(jobOpeningId: string): Promise<Proposal[]> {
  return get<Proposal[]>(`/applications/job-opening/${jobOpeningId}`);
}

export async function acceptProposal(proposalId: string): Promise<Proposal> {
  return post<Proposal>(`/applications/${proposalId}/accept`);
}

export async function rejectProposal(proposalId: string): Promise<Proposal> {
  return post<Proposal>(`/applications/${proposalId}/reject`);
}

export async function withdrawProposal(proposalId: string): Promise<Proposal> {
  return post<Proposal>(`/applications/${proposalId}/withdraw`);
}
