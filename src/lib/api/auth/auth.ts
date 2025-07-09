import { ApiResult, sendRequest } from "@/lib/api/cosmosServerClient";

type AuthenticateUserRequest = {
  email: string;
  password: string;
};

export type AuthenticateUserResponse = {
  token: string;
  user: User;
};

type User = {
  username: string;
  email: string;
  role: string;
};

export const authenticateUser = async (
  values: AuthenticateUserRequest,
): Promise<ApiResult<AuthenticateUserResponse>> => {
  return sendRequest<AuthenticateUserRequest, AuthenticateUserResponse>(
    "POST",
    "/auth/login",
    values,
  );
};
