"use client";

import { useState, useCallback } from "react";
import {
  formsApi,
  FormTemplate,
  FormAnswer,
  RecruitRequest,
} from "@/lib/forms-api";
import { toApiError } from "@/lib/api/modules/common";

interface UseFormSubmitOptions {
  onSuccess?: (request: RecruitRequest) => void;
  onError?: (error: Error) => void;
}

export function useFormSubmit(options?: UseFormSubmitOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitForm = useCallback(
    async (
      templateId: string,
      answers: FormAnswer[],
      recruiterId?: string,
      companyId?: string
    ) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const request = await formsApi.submitRecruiterRequest({
          formTemplateId: templateId,
          ...(recruiterId && { recruiterId }),
          ...(companyId && { companyId }),
          answers,
        });

        setSuccessMessage("Request submitted successfully!");
        options?.onSuccess?.(request);
        return request;
      } catch (err) {
        const apiError = toApiError(err);
        const normalized = new Error(apiError.message);
        setError(normalized);
        options?.onError?.(normalized);
        throw normalized;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    submitForm,
    isLoading,
    error,
    successMessage,
    reset,
  };
}

interface UseFormTemplatesOptions {
  autoFetch?: boolean;
}

export function useFormTemplates(options?: UseFormTemplatesOptions) {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await formsApi.fetchFormTemplates();
      setTemplates(data.filter((t) => t.isActive !== false));
    } catch (err) {
      const apiError = toApiError(err);
      setError(new Error(apiError.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    setTemplates,
  };
}
