import { sendRequest } from "~/lib/api/cosmosServerClient";

type AuthenticateRequest = {
  email: string;
  password: string;
};

type AuthenticateResponse = {
  success: boolean;
  error?: string;
};

export const authenticate = async (
  values: AuthenticateRequest,
): Promise<AuthenticateResponse> => {
  return sendRequest<AuthenticateRequest, AuthenticateResponse>(
    "POST",
    "/admin/authenticate",
    values,
  );
};
