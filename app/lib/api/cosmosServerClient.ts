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
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
};

export { sendRequest };
