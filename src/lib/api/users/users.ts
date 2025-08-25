import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";

export type RegisterUserRequest = {
  username: string;
  email: string;
  password: string;
  role: string;
};

export type RegisterUserResponse = {
  User: {
    username: string;
    email: string;
    role: string;
  };
};

export async function registerUser(
  request: RegisterUserRequest,
): Promise<ApiResult<RegisterUserResponse>> {
  return sendRequestWithAuth<RegisterUserRequest, RegisterUserResponse>(
    "POST",
    "/users",
    request,
  );
}

// -------------------------------------------------------------------

export type GetUsersResponse = {
  users: Array<{
    username: string;
    email: string;
    role: string;
    team?: {
      name: string;
      description: string;
    };
  }>;
};

export async function getUsers(): Promise<ApiResult<GetUsersResponse>> {
  return sendRequestWithAuth<never, GetUsersResponse>("GET", "/users");
}

// -------------------------------------------------------------------

export type GetUserResponse = {
  user: {
    username: string;
    email: string;
    role: string;
    team?: {
      name: string;
      description: string;
    };
  };
};

export async function getOwnUser(): Promise<ApiResult<GetUserResponse>> {
  return sendRequestWithAuth<never, GetUserResponse>("GET", `/users/me`, null);
}

// -------------------------------------------------------------------

export async function deleteUser(email: string): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>("DELETE", `/users`, null, { email });
}
