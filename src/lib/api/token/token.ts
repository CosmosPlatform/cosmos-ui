import { ApiResult, sendRequestWithAuth } from "@/lib/api/cosmosServerClient";

export type Token = {
  Name: string;
  Team: string;
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
