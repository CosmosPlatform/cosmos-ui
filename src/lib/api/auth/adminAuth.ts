"use server";

import { sendRequest } from "@/lib/api/cosmosServerClient";

type AuthenticateAdminRequest = {
  email: string;
  password: string;
};

type AuthenticateAdminResponse = {
  success: boolean;
  error?: string;
};

export const authenticateAdmin = async (
  values: AuthenticateAdminRequest,
): Promise<AuthenticateAdminResponse> => {
  return sendRequest<AuthenticateAdminRequest, AuthenticateAdminResponse>(
    "POST",
    "/admin/authenticate",
    values,
  );
};
