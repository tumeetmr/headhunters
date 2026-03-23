"use client";

import { proposalsApi } from "@/lib/api/modules/proposals";
import { useApiOperation } from "@/hooks/api/useApiOperation";

export function useProposalsApi() {
  const submitProposal = useApiOperation(proposalsApi.submitProposal);
  const fetchMyProposals = useApiOperation(proposalsApi.fetchMyProposals);
  const fetchJobProposals = useApiOperation(proposalsApi.fetchJobProposals);
  const acceptProposal = useApiOperation(proposalsApi.acceptProposal);
  const rejectProposal = useApiOperation(proposalsApi.rejectProposal);
  const withdrawProposal = useApiOperation(proposalsApi.withdrawProposal);

  return {
    submitProposal,
    fetchMyProposals,
    fetchJobProposals,
    acceptProposal,
    rejectProposal,
    withdrawProposal,
  };
}
