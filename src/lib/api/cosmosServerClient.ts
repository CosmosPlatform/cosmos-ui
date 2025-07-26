"use client";

import { serverConfig } from "@/config/serverConfig";
import { GetToken } from "../context";

// Function to send a request to the Cosmos server
// This function is generic and can be used for any request type and any type of answer.
// Method should be a valid HTTP method (GET, POST, PUT, DELETE)
// Path should be the endpoint of the server
// Body should be the request body, if applicable
type ApiResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: ApiErrorResponse };

const sendRequest = async <TRequest extends object, TResponse>(
  method: string,
  path: string,
  body?: TRequest | null,
  queryParams?: Record<string, string> | null,
): Promise<ApiResult<TResponse>> => {
  let url = `${serverConfig.serverUrl}${path}`;

  if (queryParams && Object.keys(queryParams).length > 0) {
    const queryString = new URLSearchParams(queryParams).toString();
    url += `?${queryString}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = GetToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return {
      error: {
        error:
          error instanceof Error ? error.message : "Network error occurred",
        status: 0,
      },
    };
  }

  if (!response.ok) {
    let errorResponse: ApiErrorResponse;

    try {
      errorResponse = await response.json();
    } catch (e) {
      errorResponse = {
        error: `An unexpected error occurred: ${e}`,
        status: response.status,
      };
    }

    return { error: { ...errorResponse, status: response.status } };
  }

  try {
    const data = await response.json();
    return { data };
  } catch {
    // If JSON parsing fails, we return null for empty responses
    return { data: null as TResponse };
  }
};

// Generic error response structure matching your Go backend
interface ApiErrorResponse {
  error: string;
  details?: string[];
  status: number;
}

export { sendRequest };
export type { ApiResult };
