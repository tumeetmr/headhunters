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

export const proposalsApi = {
  submitProposal(payload: SubmitProposalPayload) {
    return post<Proposal>("/applications", payload);
  },

  fetchMyProposals() {
    return get<Proposal[]>("/applications/my");
  },

  fetchJobProposals(jobOpeningId: string) {
    return get<Proposal[]>(`/applications/job-opening/${jobOpeningId}`);
  },

  acceptProposal(proposalId: string) {
    return post<Proposal>(`/applications/${proposalId}/accept`);
  },

  rejectProposal(proposalId: string) {
    return post<Proposal>(`/applications/${proposalId}/reject`);
  },

  withdrawProposal(proposalId: string) {
    return post<Proposal>(`/applications/${proposalId}/withdraw`);
  },
};
