import { proposalsApi } from "@/lib/api/modules/proposals";

export * from "@/lib/api/modules/proposals";

export const submitProposal = proposalsApi.submitProposal;
export const fetchMyProposals = proposalsApi.fetchMyProposals;
export const fetchJobProposals = proposalsApi.fetchJobProposals;
export const acceptProposal = proposalsApi.acceptProposal;
export const rejectProposal = proposalsApi.rejectProposal;
export const withdrawProposal = proposalsApi.withdrawProposal;
