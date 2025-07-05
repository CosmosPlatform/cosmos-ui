const serverBaseURL = process.env.SERVER_URL || "http://localhost:8080";

// Function to send a request to the Cosmos server
// This function is generic and can be used for any request type and any type of answer.
// Method should be a valid HTTP method (GET, POST, PUT, DELETE)
// Path should be the endpoint of the server
// Body should be the request body, if applicable
const sendRequest = async <TRequest extends object, TResponse>(
  method: string,
  path: string,
  body?: TRequest,
): Promise<TResponse> => {
  const url = `${serverBaseURL}${path}`;
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
      errorResponse = { error: `An unexpected error occurred: ${e}` };
    }

    throw new ApiError(response.status, errorResponse);
  }

  return response.json() as Promise<TResponse>;
};

// Generic error response structure matching your Go backend
interface ApiErrorResponse {
  error: string;
  details?: string[];
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(
    public status: number,
    public errorResponse: ApiErrorResponse,
  ) {
    super(errorResponse.error);
    this.name = "ApiError";
  }
}

export { sendRequest, ApiError };
