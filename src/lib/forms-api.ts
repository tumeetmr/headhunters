import { formsApi } from "@/lib/api/modules/forms";

export {
  type CreateRequestPayload,
  type FormAnswer,
  type FormField,
  type FormTemplate,
  type RecruitRequest,
} from "@/lib/api/modules/forms";

export { formsApi };

export const fetchFormTemplates = formsApi.fetchFormTemplates;
export const fetchFormTemplate = formsApi.fetchFormTemplate;
export const submitRecruiterRequest = formsApi.submitRecruiterRequest;
export const fetchRequests = formsApi.fetchRequests;
export const fetchRequest = formsApi.fetchRequest;
export const updateRequestStatus = formsApi.updateRequestStatus;
export const submitCounterProposal = formsApi.submitCounterProposal;
export const resolveCounterProposal = formsApi.resolveCounterProposal;
