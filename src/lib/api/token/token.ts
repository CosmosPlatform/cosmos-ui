import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";

export type Token = {
  name: string;
  team: string;
};

// -----------------------------------------------------------------

export type CreateTokenRequest = {
  name: string;
  value: string;
};

export async function createToken(
  teamName: string,
  request: CreateTokenRequest,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<CreateTokenRequest, null>(
    "POST",
    `/tokens/${teamName}`,
    request,
  );
}

// -----------------------------------------------------------------

export type GetTokensResponse = {
  tokens: Array<Token>;
};

export async function getTokens(
  teamName: string,
): Promise<ApiResult<GetTokensResponse>> {
  return sendRequestWithAuth<never, GetTokensResponse>(
    "GET",
    `/tokens/${teamName}`,
  );
}

// -----------------------------------------------------------------

export async function deleteToken(
  teamName: string,
  tokenName: string,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<never, null>(
    "DELETE",
    `/tokens/${teamName}/${tokenName}`,
  );
}

// -----------------------------------------------------------------

export type UpdateTokenRequest = {
  name?: string;
  value?: string;
};

export async function updateToken(
  teamName: string,
  tokenName: string,
  request: UpdateTokenRequest,
): Promise<ApiResult<null>> {
  return sendRequestWithAuth<UpdateTokenRequest, null>(
    "PUT",
    `/tokens/${teamName}/${tokenName}`,
    request,
  );
}

// -----------------------------------------------------------------

export async function getAllTokens(): Promise<ApiResult<GetTokensResponse>> {
  return sendRequestWithAuth<never, GetTokensResponse>("GET", `/tokens`);
}
