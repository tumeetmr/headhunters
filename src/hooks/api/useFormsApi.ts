"use client";

import { formsApi } from "@/lib/api/modules/forms";
import { useApiOperation } from "@/hooks/api/useApiOperation";

export function useFormsApi() {
  const fetchFormTemplates = useApiOperation(formsApi.fetchFormTemplates);
  const fetchFormTemplate = useApiOperation(formsApi.fetchFormTemplate);
  const submitRecruiterRequest = useApiOperation(formsApi.submitRecruiterRequest);
  const fetchRequests = useApiOperation(formsApi.fetchRequests);
  const fetchRequest = useApiOperation(formsApi.fetchRequest);
  const updateRequestStatus = useApiOperation(formsApi.updateRequestStatus);
  const submitCounterProposal = useApiOperation(formsApi.submitCounterProposal);
  const resolveCounterProposal = useApiOperation(formsApi.resolveCounterProposal);

  return {
    fetchFormTemplates,
    fetchFormTemplate,
    submitRecruiterRequest,
    fetchRequests,
    fetchRequest,
    updateRequestStatus,
    submitCounterProposal,
    resolveCounterProposal,
  };
}
