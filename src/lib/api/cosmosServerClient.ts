"use client";

import { serverConfig } from "@/config/serverConfig";

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
  body?: TRequest,
): Promise<ApiResult<TResponse>> => {
  const url = `${serverConfig.serverUrl}${path}`;
  const headers = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

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

  const data = await response.json();
  return { data };
};

// Generic error response structure matching your Go backend
interface ApiErrorResponse {
  error: string;
  details?: string[];
  status: number;
}

export { sendRequest };
export type { ApiResult };
