import { isAxiosError } from "axios";

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

export function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;

    const message = Array.isArray(data?.message)
      ? data.message[0]
      : data?.message || data?.error || error.message || "Request failed";

    return {
      message,
      statusCode: error.response?.status,
      details: data,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unknown error" };
}

export function handleApiResponse<T>(data: T): T {
  return data;
}
